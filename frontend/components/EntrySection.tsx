import { Plane, CheckCircle, XCircle, Clock } from "lucide-react";
import type { EntryRequirement } from "@/lib/types";

interface Props {
  entry: EntryRequirement | null;
}

export default function EntrySection({ entry }: Props) {
  return (
    <>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <div className="section-icon">
          <Plane className="h-4 w-4 text-accent" />
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
              <p className="font-bold text-foreground">ビザ</p>
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
                <p className="font-bold text-foreground">アライバルビザ</p>
                <p className="text-sm font-medium text-blue-400">取得可能</p>
              </div>
            </div>
          )}

          {/* ビザなし滞在日数 */}
          {entry.visa_free_days != null && (
            <div className="rounded-xl glass-card p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground">ビザなし滞在可能日数</p>
                <p className="text-lg font-black text-accent">{entry.visa_free_days}日</p>
              </div>
            </div>
          )}

          {/* パスポート残存有効期間 */}
          {entry.passport_validity_months != null && (
            <div className="rounded-xl glass-card p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <Plane className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground">パスポート残存有効期間</p>
                <p className="text-sm font-bold text-accent">{entry.passport_validity_months}ヶ月以上</p>
              </div>
            </div>
          )}

          {/* 備考 */}
          {entry.notes && (
            <div className="sm:col-span-2 rounded-xl glass-card p-4">
              <p className="font-bold text-foreground mb-2">備考</p>
              <p className="text-sm text-muted leading-relaxed">{entry.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">入国要件を取得できませんでした</p>
      )}
    </>
  );
}
