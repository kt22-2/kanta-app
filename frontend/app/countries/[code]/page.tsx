import Link from "next/link";
import {
  Shield,
  Plane,
  MapPin,
  Newspaper,
  Info,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Thermometer,
  DollarSign,
  Mail,
} from "lucide-react";
import { getCountry, getSafetyInfo, getEntryRequirement, getWikiSummary, getEconomicInfo } from "@/lib/api";
import { formatPopulation, getRegionLabel, getSafetyColor } from "@/lib/utils";
import type { SafetyInfo, EntryRequirement, WikiSummary, EconomicInfo } from "@/lib/types";
import SafetyBadge from "@/components/SafetyBadge";
import SectionAnchor from "@/components/SectionAnchor";
import AttractionsSection from "@/components/AttractionsSection";
import NewsSection from "@/components/NewsSection";
import WikiSummaryCard from "@/components/WikiSummaryCard";
import ExchangeWidget from "@/components/ExchangeWidget";
import ClimateSection from "@/components/ClimateSection";
import type { SafetyLevel } from "@/lib/types";

interface Props {
  params: Promise<{ code: string }>;
}

const SECTIONS = [
  { id: "info", label: "基本情報" },
  { id: "safety", label: "安全情報" },
  { id: "entry", label: "入国要件" },
  { id: "spots", label: "観光スポット" },
  { id: "news", label: "現地ニュース" },
];

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params;

  let country = null;
  let safety: SafetyInfo | null = null;
  let entry: EntryRequirement | null = null;
  let wiki: WikiSummary | null = null;
  let economic: EconomicInfo | null = null;

  try {
    country = await getCountry(code);
  } catch {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-[#8899AA]">国情報の読み込みに失敗しました</p>
      </div>
    );
  }

  const [safetyResult, entryResult, wikiResult, economicResult] = await Promise.allSettled([
    getSafetyInfo(code),
    getEntryRequirement(code),
    getWikiSummary(code),
    getEconomicInfo(code),
  ]);
  if (safetyResult.status === "fulfilled") safety = safetyResult.value;
  if (entryResult.status === "fulfilled") entry = entryResult.value;
  if (wikiResult.status === "fulfilled") wiki = wikiResult.value;
  if (economicResult.status === "fulfilled") economic = economicResult.value;

  const severityColors: Record<string, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  function parseMailDesc(desc: string) {
    const m = desc.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*([\s\S]+)$/);
    return m ? { date: m[1], text: m[2] } : { date: null, text: desc };
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* パンくず */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-[#8899AA]">
        <Link href="/" className="hover:text-[#C8A96E] transition-colors">ホーム</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/countries" className="hover:text-[#C8A96E] transition-colors">国一覧</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#F5F5F0]">{country.name}</span>
      </nav>

      {/* 1. ヘッダーカード（lg: 横分割） */}
      <div className="mb-6 overflow-hidden rounded-2xl glass-card gradient-border-hover">
        <div className="lg:flex">
          {/* 左: 国旗エリア */}
          <div className="relative h-48 lg:h-auto lg:min-h-[220px] lg:w-[55%] overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={country.flag_url}
              alt={`${country.name} 国旗`}
              className="w-full h-full object-cover opacity-70 transition-transform duration-500"
            />
            {/* モバイル: 縦グラデーション / PC: 横グラデーション */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1923] via-[#1C2D3E]/30 to-transparent lg:bg-none" />
            <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-transparent to-[#0F1923]/80" />
            <span className="absolute bottom-4 left-4 text-5xl lg:text-6xl">{country.flag_emoji}</span>
            {safety && (
              <div className="absolute top-3 right-3">
                <SafetyBadge level={safety.level as SafetyLevel} size="md" />
              </div>
            )}
          </div>

          {/* 右: 国基本情報 */}
          <div className="p-5 lg:p-8 lg:flex lg:flex-col lg:justify-center lg:w-[45%]">
            <h1 className="text-2xl lg:text-3xl font-black text-[#F5F5F0]">{country.name}</h1>
            {country.name_ja && (
              <p className="text-[#8899AA] text-sm lg:text-base mt-1 mb-4">{country.name_ja}</p>
            )}
            {/* 首都・地域・人口 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {country.capital && (
                <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                  <p className="text-xs text-[#8899AA] mb-0.5">首都</p>
                  <p className="font-semibold text-[#F5F5F0] truncate">{country.capital}</p>
                </div>
              )}
              <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                <p className="text-xs text-[#8899AA] mb-0.5">地域</p>
                <p className="font-semibold text-[#F5F5F0] truncate">{getRegionLabel(country.region)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                <p className="text-xs text-[#8899AA] mb-0.5">人口</p>
                <p className="font-semibold text-[#F5F5F0] truncate">{formatPopulation(country.population)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Wikipedia概要カード */}
      {wiki && wiki.available && (
        <div className="mb-4">
          <WikiSummaryCard wiki={wiki} />
        </div>
      )}

      {/* 3. SectionAnchor（sticky） */}
      <SectionAnchor sections={SECTIONS} />

      {/* 4. #info 基本情報セクション */}
      <section id="info" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10 shrink-0">
            <Info className="h-4 w-4 text-[#C8A96E]" />
          </div>
          基本情報
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 言語 */}
          <div className="rounded-xl glass-card p-4">
            <p className="text-xs text-[#8899AA] mb-1">言語</p>
            <p className="text-sm font-medium text-[#F5F5F0]">
              {country.languages.join("、") || "情報なし"}
            </p>
          </div>

          {/* 通貨 */}
          <div className="rounded-xl glass-card p-4">
            <p className="text-xs text-[#8899AA] mb-1">通貨</p>
            {country.currencies.length > 0 ? (
              <div className="space-y-1">
                {country.currencies.map((c) => (
                  <p key={c.code} className="text-sm font-medium text-[#F5F5F0]">
                    {c.name} ({c.code}){c.symbol ? ` - ${c.symbol}` : ""}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#F5F5F0]">情報なし</p>
            )}
          </div>

          {/* タイムゾーン */}
          <div className="rounded-xl glass-card p-4">
            <p className="text-xs text-[#8899AA] mb-1">タイムゾーン</p>
            <p className="text-sm text-[#F5F5F0]">
              {country.timezones && country.timezones.length > 0
                ? country.timezones.slice(0, 3).join("、")
                : "情報なし"}
            </p>
          </div>

          {/* 一人当たりGDP */}
          {economic && economic.available && economic.gdp_per_capita != null && (
            <div className="rounded-xl glass-card p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10 shrink-0">
                <DollarSign className="h-5 w-5 text-[#C8A96E]" />
              </div>
              <div>
                <p className="text-xs text-[#8899AA] mb-0.5">一人当たりGDP</p>
                <p className="text-sm font-bold text-[#F5F5F0]">
                  ${economic.gdp_per_capita.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  {economic.gdp_year && (
                    <span className="text-xs text-[#8899AA] font-normal ml-2">· {economic.gdp_year}年</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* 為替レートウィジェット（横幅いっぱい） */}
          <div className="sm:col-span-2">
            <ExchangeWidget code={code} />
          </div>

          {/* 気候チャート（横幅いっぱい） */}
          <div className="sm:col-span-2">
            <ClimateSection code={code} />
          </div>

          {/* 隣国リンク（横幅いっぱい） */}
          {country.borders && country.borders.length > 0 && (
            <div className="sm:col-span-2 rounded-xl glass-card p-4">
              <p className="text-xs text-[#8899AA] mb-2">隣接国</p>
              <div className="flex flex-wrap gap-2">
                {country.borders.map((border) => (
                  <Link
                    key={border}
                    href={`/countries/${border}`}
                    className="rounded-full px-3 py-1 text-xs font-medium border border-[#C8A96E]/40 text-[#C8A96E] hover:bg-[#C8A96E]/10 transition-colors"
                  >
                    {border}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. #safety 安全情報セクション */}
      <section id="safety" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10 shrink-0">
            <Shield className="h-4 w-4 text-[#C8A96E]" />
          </div>
          安全情報
        </h2>
        {safety ? (
          <div className="space-y-3">
            {/* 危険レベルゲージ */}
            <div className={`rounded-xl border p-5 ${getSafetyColor(safety.level as SafetyLevel)}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold opacity-80">
                  危険レベル {safety.level}
                </span>
                <SafetyBadge level={safety.level as SafetyLevel} size="md" />
              </div>
              <div className="mb-3 flex gap-1">
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-2 flex-1 rounded-full ${
                      lvl <= (safety?.level ?? 0)
                        ? lvl <= 1
                          ? "bg-green-400"
                          : lvl === 2
                            ? "bg-orange-400"
                            : "bg-red-400"
                        : "bg-[#0F1923]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed">{safety.summary}</p>
            </div>

            {/* 感染症レベル */}
            {(safety.infection_level ?? 0) > 0 && (
              <div className="rounded-xl glass-card p-4 flex items-center gap-4">
                <Thermometer className="h-8 w-8 text-orange-400 shrink-0" />
                <div>
                  <p className="font-bold text-[#F5F5F0]">感染症危険情報</p>
                  <p className="text-sm text-orange-400">レベル {safety.infection_level}</p>
                </div>
              </div>
            )}

            {/* 外務省・安全対策リンク */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={safety.mofa_url || "https://www.anzen.mofa.go.jp/"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-[#C8A96E]/30 bg-[#C8A96E]/10 p-4 hover:bg-[#C8A96E]/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#C8A96E] shrink-0" />
                  <span className="text-sm font-semibold text-[#F5F5F0]">外務省 海外安全情報</span>
                </div>
                <ExternalLink className="h-4 w-4 text-[#C8A96E] shrink-0" />
              </a>
              {safety.safety_measure_url && (
                <a
                  href={safety.safety_measure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl glass-card p-4 hover:border-[#C8A96E]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[#8899AA] shrink-0" />
                    <span className="text-sm text-[#8899AA]">安全対策基礎データ</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#8899AA] shrink-0" />
                </a>
              )}
            </div>

            {/* 注意事項（領事メール以外） */}
            {safety.details.filter(d => d.category !== "領事メール").length > 0 && (
              <div>
                <h3 className="mb-3 font-bold text-[#F5F5F0] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#C8A96E]" />
                  注意事項
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safety.details.filter(d => d.category !== "領事メール").map((detail, i) => (
                    <div key={i} className="rounded-xl glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-[#F5F5F0]">
                          {detail.category}
                        </span>
                        <span className={`text-xs font-medium ${severityColors[detail.severity] ?? "text-[#8899AA]"}`}>
                          {detail.severity === "low" ? "低" : detail.severity === "medium" ? "中" : "高"}
                        </span>
                      </div>
                      <p className="text-sm text-[#8899AA] leading-relaxed">{detail.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 領事館からのお知らせ */}
            {safety.details.filter(d => d.category === "領事メール").length > 0 && (
              <div>
                <h3 className="mb-3 font-bold text-[#F5F5F0] flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C8A96E]" />
                  領事館からのお知らせ
                </h3>
                <div className="space-y-2">
                  {safety.details.filter(d => d.category === "領事メール").map((detail, i) => {
                    const { date, text } = parseMailDesc(detail.description);
                    const dotIdx = text.indexOf("。");
                    const title = dotIdx !== -1 ? text.slice(0, dotIdx + 1) : text.slice(0, 60) + (text.length > 60 ? "…" : "");
                    const body = dotIdx !== -1 && dotIdx < text.length - 1 ? text.slice(dotIdx + 1).trim() : null;
                    return (
                      <details key={i} className="group rounded-xl glass-card overflow-hidden">
                        <summary className="flex cursor-pointer select-none items-start gap-3 p-4 marker:content-none list-none">
                          <svg
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A96E] transition-transform duration-200 group-open:rotate-90"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            {date && (
                              <span className="inline-block text-xs text-[#8899AA] mb-1">{date}</span>
                            )}
                            <p className="text-sm text-[#F5F5F0] leading-snug">{title}</p>
                          </div>
                        </summary>
                        {body && (
                          <div className="px-4 pb-4 pl-11">
                            <p className="text-sm text-[#8899AA] leading-relaxed">{body}</p>
                          </div>
                        )}
                      </details>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#8899AA]">安全情報を取得できませんでした</p>
        )}
      </section>

      {/* 6. #entry 入国要件セクション */}
      <section id="entry" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10 shrink-0">
            <Plane className="h-4 w-4 text-[#C8A96E]" />
          </div>
          入国要件
        </h2>
        {entry ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ビザ必要性 */}
            <div className="rounded-xl glass-card p-4 flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${entry.visa_required ? "bg-red-400/10" : "bg-green-400/10"}`}>
                {entry.visa_required ? (
                  <XCircle className="h-6 w-6 text-red-400" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-[#F5F5F0]">ビザ</p>
                <p className={`text-sm font-medium ${entry.visa_required ? "text-red-400" : "text-green-400"}`}>
                  {entry.visa_required ? "必要" : "不要"}
                </p>
              </div>
            </div>

            {/* アライバルビザ */}
            {entry.visa_on_arrival && (
              <div className="rounded-xl glass-card p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400/10 shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-[#F5F5F0]">アライバルビザ</p>
                  <p className="text-sm font-medium text-blue-400">取得可能</p>
                </div>
              </div>
            )}

            {/* ビザなし滞在日数 */}
            {entry.visa_free_days != null && (
              <div className="rounded-xl glass-card p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C8A96E]/10 shrink-0">
                  <Clock className="h-6 w-6 text-[#C8A96E]" />
                </div>
                <div>
                  <p className="font-bold text-[#F5F5F0]">ビザなし滞在可能日数</p>
                  <p className="text-lg font-black text-[#C8A96E]">{entry.visa_free_days}日</p>
                </div>
              </div>
            )}

            {/* パスポート残存有効期間 */}
            {entry.passport_validity_months != null && (
              <div className="rounded-xl glass-card p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C8A96E]/10 shrink-0">
                  <Plane className="h-6 w-6 text-[#C8A96E]" />
                </div>
                <div>
                  <p className="font-bold text-[#F5F5F0]">パスポート残存有効期間</p>
                  <p className="text-sm font-bold text-[#C8A96E]">{entry.passport_validity_months}ヶ月以上</p>
                </div>
              </div>
            )}

            {/* 備考（横幅いっぱい） */}
            {entry.notes && (
              <div className="sm:col-span-2 rounded-xl glass-card p-4">
                <p className="font-bold text-[#F5F5F0] mb-2">備考</p>
                <p className="text-sm text-[#8899AA] leading-relaxed">{entry.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#8899AA]">入国要件を取得できませんでした</p>
        )}
      </section>

      {/* 7. #spots 観光スポットセクション（Client） */}
      <section id="spots" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10 shrink-0">
            <MapPin className="h-4 w-4 text-[#C8A96E]" />
          </div>
          観光スポット
        </h2>
        <AttractionsSection code={code} />
      </section>

      {/* 8. #news 現地ニュースセクション（Client） */}
      <section id="news" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C8A96E]/20 to-[#E8C980]/10 shrink-0">
            <Newspaper className="h-4 w-4 text-[#C8A96E]" />
          </div>
          現地ニュース
        </h2>
        <NewsSection code={code} />
      </section>

      {/* 9. フッター */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg glass-card p-3 text-xs text-[#8899AA]">
          ※ 本ページの情報は参考情報です。渡航前に必ず外務省・大使館等で最新情報をご確認ください。
        </div>
        <div className="rounded-lg glass-card p-3 text-xs text-[#8899AA]">
          <p className="font-semibold mb-1 text-[#F5F5F0]/70">データソース</p>
          <ul className="space-y-0.5">
            <li>REST Countries · 外務省 XML OpenData</li>
            <li>Claude AI · OpenTripMap · Wikipedia</li>
            <li>Frankfurter · Open-Meteo · World Bank · GNews</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
