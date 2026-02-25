import Link from "next/link";
import { Shield, ChevronRight, AlertTriangle } from "lucide-react";
import { getSafetyInfo } from "@/lib/api";
import { getSafetyColor } from "@/lib/utils";
import SafetyBadge from "@/components/SafetyBadge";
import type { SafetyLevel } from "@/lib/types";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function SafetyPage({ params }: Props) {
  const { code } = await params;

  let safety = null;
  try {
    safety = await getSafetyInfo(code);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[#8899AA]">
        安全情報の読み込みに失敗しました
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs text-[#8899AA]">
        <Link href="/countries" className="hover:text-[#C8A96E]">国一覧</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/countries/${code}`} className="hover:text-[#C8A96E]">{code}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#F5F5F0]">安全情報</span>
      </nav>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-[#1C2D3E] p-2.5">
          <Shield className="h-6 w-6 text-[#C8A96E]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#F5F5F0]">安全情報</h1>
          <p className="text-xs text-[#8899AA]">{code.toUpperCase()}</p>
        </div>
      </div>

      {/* 危険レベルカード */}
      <div className={`mb-6 rounded-xl border p-5 ${getSafetyColor(safety.level as SafetyLevel)}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold opacity-80">危険レベル {safety.level}</span>
          <SafetyBadge level={safety.level as SafetyLevel} size="md" />
        </div>
        <p className="text-sm leading-relaxed">{safety.summary}</p>
      </div>

      {/* 詳細情報 */}
      {safety.details.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-[#F5F5F0] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#C8A96E]" />
            注意事項
          </h2>
          {safety.details.map((detail, i) => (
            <div key={i} className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-[#F5F5F0]">{detail.category}</span>
                <span className={`text-xs font-medium ${severityColors[detail.severity] ?? "text-[#8899AA]"}`}>
                  {detail.severity === "low" ? "低" : detail.severity === "medium" ? "中" : "高"}
                </span>
              </div>
              <p className="text-sm text-[#8899AA] leading-relaxed">{detail.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-[#1C2D3E] bg-[#1C2D3E]/50 p-3 text-xs text-[#8899AA]">
        ※ 最新の渡航安全情報は外務省「海外安全情報」をご確認ください
      </div>
    </div>
  );
}
