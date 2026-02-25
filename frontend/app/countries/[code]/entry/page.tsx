import Link from "next/link";
import { Plane, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { getEntryRequirement } from "@/lib/api";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function EntryPage({ params }: Props) {
  const { code } = await params;

  let entry = null;
  try {
    entry = await getEntryRequirement(code);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[#8899AA]">
        入国要件の読み込みに失敗しました
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
        <span className="text-[#F5F5F0]">入国要件</span>
      </nav>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-[#1C2D3E] p-2.5">
          <Plane className="h-6 w-6 text-[#C8A96E]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#F5F5F0]">入国要件</h1>
          <p className="text-xs text-[#8899AA]">{code.toUpperCase()} / 日本国パスポート基準</p>
        </div>
      </div>

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
            <p className={`text-sm ${entry.visa_required ? "text-red-400" : "text-green-400"}`}>
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
              <p className="text-sm text-[#C8A96E] font-bold text-lg">{entry.visa_free_days}日</p>
            </div>
          </div>
        )}

        {/* パスポート残存有効期間 */}
        {entry.passport_validity_months != null && (
          <div className="rounded-xl border border-[#1C2D3E] bg-[#1C2D3E] p-4 flex items-center gap-4">
            <Plane className="h-8 w-8 text-[#C8A96E] shrink-0" />
            <div>
              <p className="font-bold text-[#F5F5F0]">パスポート残存有効期間</p>
              <p className="text-sm text-[#C8A96E] font-bold">{entry.passport_validity_months}ヶ月以上</p>
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

      <div className="mt-6 rounded-lg border border-[#1C2D3E] bg-[#1C2D3E]/50 p-3 text-xs text-[#8899AA]">
        ※ 入国要件は変更になる場合があります。渡航前に大使館・領事館で最新情報をご確認ください
      </div>
    </div>
  );
}
