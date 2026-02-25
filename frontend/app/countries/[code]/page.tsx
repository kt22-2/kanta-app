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
} from "lucide-react";
import { getCountry, getSafetyInfo, getEntryRequirement } from "@/lib/api";
import { formatPopulation, getRegionLabel, getSafetyColor } from "@/lib/utils";
import SafetyBadge from "@/components/SafetyBadge";
import SectionAnchor from "@/components/SectionAnchor";
import AttractionsSection from "@/components/AttractionsSection";
import NewsSection from "@/components/NewsSection";
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
  let safety = null;
  let entry = null;

  try {
    country = await getCountry(code);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-[#8899AA]">国情報の読み込みに失敗しました</p>
      </div>
    );
  }

  try {
    safety = await getSafetyInfo(code);
  } catch {
    // 安全情報は任意
  }

  try {
    entry = await getEntryRequirement(code);
  } catch {
    // 入国要件は任意
  }

  const severityColors: Record<string, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* パンくず */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-[#8899AA]">
        <Link href="/" className="hover:text-[#C8A96E]">ホーム</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/countries" className="hover:text-[#C8A96E]">国一覧</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#F5F5F0]">{country.name}</span>
      </nav>

      {/* 1. ヘッダー */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-[#1C2D3E] bg-[#1C2D3E]">
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={country.flag_url}
            alt={`${country.name} 国旗`}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C2D3E] to-transparent" />
          <span className="absolute bottom-3 left-4 text-5xl">{country.flag_emoji}</span>
          {safety && (
            <div className="absolute top-3 right-3">
              <SafetyBadge level={safety.level as SafetyLevel} size="md" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h1 className="text-2xl font-black text-[#F5F5F0]">{country.name}</h1>
          {country.name_ja && (
            <p className="text-[#8899AA] text-sm">{country.name_ja}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {country.capital && (
              <div>
                <span className="text-[#8899AA]">首都</span>
                <p className="font-medium text-[#F5F5F0]">{country.capital}</p>
              </div>
            )}
            <div>
              <span className="text-[#8899AA]">地域</span>
              <p className="font-medium text-[#F5F5F0]">{getRegionLabel(country.region)}</p>
            </div>
            <div>
              <span className="text-[#8899AA]">人口</span>
              <p className="font-medium text-[#F5F5F0]">{formatPopulation(country.population)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SectionAnchor（sticky） */}
      <SectionAnchor sections={SECTIONS} />

      {/* 3. #info 基本情報セクション */}
      <section id="info" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <Info className="h-5 w-5 text-[#C8A96E]" />
          基本情報
        </h2>
        <div className="space-y-3">
          {/* 言語 */}
          <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
            <p className="text-xs text-[#8899AA] mb-1">言語</p>
            <p className="text-sm font-medium text-[#F5F5F0]">
              {country.languages.join("、") || "情報なし"}
            </p>
          </div>
          {/* 通貨 */}
          <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
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
          <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
            <p className="text-xs text-[#8899AA] mb-1">タイムゾーン</p>
            <p className="text-sm text-[#F5F5F0]">
              {country.timezones && country.timezones.length > 0
                ? country.timezones.slice(0, 3).join("、")
                : "情報なし"}
            </p>
          </div>
        </div>
      </section>

      {/* 4. #safety 安全情報セクション */}
      <section id="safety" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <Shield className="h-5 w-5 text-[#C8A96E]" />
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
              {/* レベルバー */}
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
            {/* 詳細情報 */}
            {safety.details.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-[#F5F5F0] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#C8A96E]" />
                  注意事項
                </h3>
                {safety.details.map((detail, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-[#F5F5F0]">
                        {detail.category}
                      </span>
                      <span
                        className={`text-xs font-medium ${severityColors[detail.severity] ?? "text-[#8899AA]"}`}
                      >
                        {detail.severity === "low"
                          ? "低"
                          : detail.severity === "medium"
                            ? "中"
                            : "高"}
                      </span>
                    </div>
                    <p className="text-sm text-[#8899AA] leading-relaxed">
                      {detail.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#8899AA]">安全情報を取得できませんでした</p>
        )}
      </section>

      {/* 5. #entry 入国要件セクション */}
      <section id="entry" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <Plane className="h-5 w-5 text-[#C8A96E]" />
          入国要件
        </h2>
        {entry ? (
          <div className="space-y-3">
            {/* ビザ必要性 */}
            <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 flex items-center gap-4">
              {entry.visa_required ? (
                <XCircle className="h-8 w-8 text-red-400 shrink-0" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-[#F5F5F0]">ビザ</p>
                <p
                  className={`text-sm ${entry.visa_required ? "text-red-400" : "text-green-400"}`}
                >
                  {entry.visa_required ? "必要" : "不要"}
                </p>
              </div>
            </div>

            {/* アライバルビザ */}
            {entry.visa_on_arrival && (
              <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-blue-400 shrink-0" />
                <div>
                  <p className="font-bold text-[#F5F5F0]">アライバルビザ</p>
                  <p className="text-sm text-blue-400">取得可能</p>
                </div>
              </div>
            )}

            {/* ビザなし滞在日数 */}
            {entry.visa_free_days != null && (
              <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 flex items-center gap-4">
                <Clock className="h-8 w-8 text-[#C8A96E] shrink-0" />
                <div>
                  <p className="font-bold text-[#F5F5F0]">ビザなし滞在可能日数</p>
                  <p className="text-sm text-[#C8A96E] font-bold text-lg">
                    {entry.visa_free_days}日
                  </p>
                </div>
              </div>
            )}

            {/* パスポート残存有効期間 */}
            {entry.passport_validity_months != null && (
              <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 flex items-center gap-4">
                <Plane className="h-8 w-8 text-[#C8A96E] shrink-0" />
                <div>
                  <p className="font-bold text-[#F5F5F0]">パスポート残存有効期間</p>
                  <p className="text-sm text-[#C8A96E] font-bold">
                    {entry.passport_validity_months}ヶ月以上
                  </p>
                </div>
              </div>
            )}

            {/* 備考 */}
            {entry.notes && (
              <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
                <p className="font-bold text-[#F5F5F0] mb-2">備考</p>
                <p className="text-sm text-[#8899AA] leading-relaxed">{entry.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#8899AA]">入国要件を取得できませんでした</p>
        )}
      </section>

      {/* 6. #spots 観光スポットセクション（Client） */}
      <section id="spots" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <MapPin className="h-5 w-5 text-[#C8A96E]" />
          観光スポット
        </h2>
        <AttractionsSection code={code} />
      </section>

      {/* 7. #news 現地ニュースセクション（Client） */}
      <section id="news" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#F5F5F0]">
          <Newspaper className="h-5 w-5 text-[#C8A96E]" />
          現地ニュース
        </h2>
        <NewsSection code={code} />
      </section>

      {/* 8. フッター */}
      <div className="space-y-3">
        <div className="rounded-lg border border-[#1C2D3E] bg-[#1C2D3E]/50 p-3 text-xs text-[#8899AA]">
          ※ 本ページの情報は参考情報です。渡航前に必ず外務省・大使館等で最新情報をご確認ください。
        </div>
        <div className="rounded-lg border border-[#1C2D3E] bg-[#1C2D3E]/50 p-3 text-xs text-[#8899AA]">
          <p className="font-semibold mb-1">データソース</p>
          <ul className="space-y-0.5">
            <li>REST Countries API - 国基本情報</li>
            <li>Claude AI - 安全情報・入国要件・観光サマリー</li>
            <li>OpenTripMap - 観光スポットデータ</li>
            <li>GNews - ニュース記事</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
