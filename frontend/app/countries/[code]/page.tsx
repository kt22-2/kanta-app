import Link from "next/link";
import { Shield, Plane, MapPin, Info, ChevronRight, Globe } from "lucide-react";
import { getCountry, getSafetyInfo } from "@/lib/api";
import { formatPopulation, getRegionLabel } from "@/lib/utils";
import SafetyBadge from "@/components/SafetyBadge";
import type { SafetyLevel } from "@/lib/types";

interface Props {
  params: Promise<{ code: string }>;
}

const SECTIONS = [
  {
    href: "safety",
    icon: Shield,
    title: "安全情報",
    desc: "危険レベル・現地の治安状況",
    color: "hover:border-green-700",
  },
  {
    href: "entry",
    icon: Plane,
    title: "入国要件",
    desc: "ビザ・パスポート残存期間",
    color: "hover:border-blue-700",
  },
  {
    href: "attractions",
    icon: MapPin,
    title: "観光スポット",
    desc: "AI厳選のおすすめスポット",
    color: "hover:border-[#C8A96E]",
  },
];

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params;

  let country = null;
  let safety = null;

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

      {/* ヘッダー */}
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
            <div>
              <span className="text-[#8899AA]">言語</span>
              <p className="font-medium text-[#F5F5F0]">{country.languages.slice(0, 2).join("・")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* セクションナビゲーション */}
      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={`/countries/${code}/${s.href}`}
            className={`flex items-center gap-4 rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 transition-all ${s.color} hover:bg-[#1A2B4A]`}
          >
            <div className="rounded-lg bg-[#0F1923] p-2.5">
              <s.icon className="h-5 w-5 text-[#C8A96E]" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-[#F5F5F0]">{s.title}</h2>
              <p className="text-xs text-[#8899AA]">{s.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8899AA]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
