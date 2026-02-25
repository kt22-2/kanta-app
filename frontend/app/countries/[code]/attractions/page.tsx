import Link from "next/link";
import { MapPin, ChevronRight, Star, Lightbulb, Calendar } from "lucide-react";
import { getAttractions } from "@/lib/api";

interface Props {
  params: Promise<{ code: string }>;
}

const CATEGORY_EMOJI: Record<string, string> = {
  自然: "🏔️",
  文化: "🏛️",
  歴史: "🏰",
  食: "🍜",
  アドベンチャー: "🧗",
  都市: "🌆",
  宗教: "⛩️",
  世界遺産: "🌍",
};

export default async function AttractionsPage({ params }: Props) {
  const { code } = await params;

  let data = null;
  try {
    data = await getAttractions(code);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[#8899AA]">
        観光情報の読み込みに失敗しました。APIキーが設定されているか確認してください。
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs text-[#8899AA]">
        <Link href="/countries" className="hover:text-[#C8A96E]">国一覧</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/countries/${code}`} className="hover:text-[#C8A96E]">{code}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#F5F5F0]">観光スポット</span>
      </nav>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-[#1C2D3E] p-2.5">
          <MapPin className="h-6 w-6 text-[#C8A96E]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#F5F5F0]">観光スポット</h1>
          <p className="text-xs text-[#8899AA]">{data.country_name} · AI生成ガイド</p>
        </div>
      </div>

      {/* ベストシーズン */}
      {data.best_season && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#C8A96E]/30 bg-[#C8A96E]/10 p-4">
          <Calendar className="h-5 w-5 text-[#C8A96E] shrink-0" />
          <div>
            <p className="text-xs text-[#C8A96E] font-semibold">ベストシーズン</p>
            <p className="text-sm text-[#F5F5F0]">{data.best_season}</p>
          </div>
        </div>
      )}

      {/* 観光スポット一覧 */}
      <div className="mb-6 space-y-3">
        <h2 className="font-bold text-[#F5F5F0] flex items-center gap-2">
          <Star className="h-4 w-4 text-[#C8A96E]" />
          おすすめスポット
        </h2>
        {data.attractions.map((attraction, i) => (
          <div key={i} className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl">
                {CATEGORY_EMOJI[attraction.category] ?? "📍"}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[#F5F5F0]">{attraction.name}</h3>
                  <span className="text-xs border border-[#C8A96E]/30 text-[#C8A96E] rounded-full px-2 py-0.5">
                    {attraction.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#8899AA] leading-relaxed">{attraction.description}</p>
              </div>
            </div>
            {attraction.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {attraction.highlights.map((h, j) => (
                  <span key={j} className="text-xs bg-[#0F1923] text-[#8899AA] rounded px-2 py-0.5">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 旅行のコツ */}
      {data.travel_tips.length > 0 && (
        <div>
          <h2 className="mb-3 font-bold text-[#F5F5F0] flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#C8A96E]" />
            旅行のコツ
          </h2>
          <ul className="space-y-2">
            {data.travel_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#8899AA]">
                <span className="mt-0.5 text-[#C8A96E] font-bold shrink-0">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
