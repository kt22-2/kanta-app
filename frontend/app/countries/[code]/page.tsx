import Link from "next/link";
import {
  MapPin,
  Newspaper,
  ChevronRight,
} from "lucide-react";
import { getCountry, getSafetyInfo, getEntryRequirement, getWikiSummary, getEconomicInfo } from "@/lib/api";
import type { SafetyInfo, EntryRequirement, WikiSummary, EconomicInfo } from "@/lib/types";
import SectionAnchor from "@/components/SectionAnchor";
import CountryHeader from "@/components/CountryHeader";
import BasicInfoSection from "@/components/BasicInfoSection";
import SafetySection from "@/components/SafetySection";
import EntrySection from "@/components/EntrySection";
import AttractionsSection from "@/components/AttractionsSection";
import NewsSection from "@/components/NewsSection";
import WikiSummaryCard from "@/components/WikiSummaryCard";
import ScrollToTop from "@/components/ScrollToTop";

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
        <p className="text-muted">国情報の読み込みに失敗しました</p>
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* パンくず */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted" aria-label="パンくずリスト">
        <Link href="/" className="hover:text-accent transition-colors">ホーム</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/countries" className="hover:text-accent transition-colors">国一覧</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{country.name_ja ?? country.name}</span>
      </nav>

      {/* ヘッダーカード */}
      <CountryHeader country={country} safety={safety} />

      {/* Wikipedia概要 */}
      {wiki && wiki.available && (
        <div className="mb-6">
          <WikiSummaryCard wiki={wiki} />
        </div>
      )}

      {/* SectionAnchor（sticky） */}
      <SectionAnchor sections={SECTIONS} />

      {/* 基本情報 */}
      <section id="info" className="mb-8" aria-labelledby="info-heading">
        <BasicInfoSection country={country} economic={economic} code={code} />
      </section>

      <div className="section-divider" />

      {/* 安全情報 */}
      <section id="safety" className="mb-8" aria-labelledby="safety-heading">
        <SafetySection safety={safety} />
      </section>

      <div className="section-divider" />

      {/* 入国要件 */}
      <section id="entry" className="mb-8" aria-labelledby="entry-heading">
        <EntrySection entry={entry} />
      </section>

      <div className="section-divider" />

      {/* 観光スポット */}
      <section id="spots" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <div className="section-icon">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          観光スポット
        </h2>
        <AttractionsSection code={code} />
      </section>

      <div className="section-divider" />

      {/* 現地ニュース */}
      <section id="news" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <div className="section-icon">
            <Newspaper className="h-4 w-4 text-accent" />
          </div>
          現地ニュース
        </h2>
        <NewsSection code={code} />
      </section>

      <ScrollToTop />
    </div>
  );
}
