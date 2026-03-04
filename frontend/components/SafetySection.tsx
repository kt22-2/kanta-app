import {
  Shield,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Thermometer,
  Mail,
  MapPin,
  Map,
} from "lucide-react";
import type { SafetyInfo, SafetyLevel } from "@/lib/types";
import { getSafetyColor } from "@/lib/utils";
import SafetyBadge from "./SafetyBadge";
import ExpandableDetailCard from "./ExpandableDetailCard";

interface Props {
  safety: SafetyInfo | null;
}

const severityColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

function parseMailDesc(desc: string) {
  const m = desc.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*([\s\S]+)$/);
  return m ? { date: m[1], text: m[2] } : { date: null, text: desc };
}

const regionalLevelColors: Record<number, string> = {
  1: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  2: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  3: "border-red-500/30 bg-red-500/10 text-red-400",
  4: "border-red-600/30 bg-red-600/10 text-red-300",
};

const regionalLevelLabels: Record<number, string> = {
  1: "十分注意",
  2: "不要不急の渡航中止",
  3: "渡航中止勧告",
  4: "退避勧告",
};

export default function SafetySection({ safety }: Props) {
  return (
    <>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <div className="section-icon">
          <Shield className="h-4 w-4 text-accent" />
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
                  className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
                    lvl <= (safety?.level ?? 0)
                      ? lvl <= 1
                        ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.3)]"
                        : lvl === 2
                          ? "bg-orange-400 shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                          : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.3)]"
                      : "bg-background"
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
                <p className="font-bold text-foreground">感染症危険情報</p>
                <p className="text-sm text-orange-400">レベル {safety.infection_level}</p>
              </div>
            </div>
          )}

          {/* 危険度マップ */}
          {safety.risk_map_url && (
            <div>
              <h3 className="mb-3 font-bold text-foreground flex items-center gap-2">
                <Map className="h-4 w-4 text-accent" />
                危険度マップ
              </h3>
              <div className="rounded-xl glass-card overflow-hidden">
                <iframe
                  src={safety.risk_map_url}
                  title="外務省危険度マップ"
                  className="w-full border-0"
                  style={{ height: "480px" }}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="px-4 py-2 border-t border-white/6 flex items-center justify-between">
                  <span className="text-xs text-muted">出典: 外務省海外安全ホームページ</span>
                  <a
                    href={safety.risk_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    拡大表示
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 地域別危険度 */}
          {safety.regional_risks && safety.regional_risks.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                地域別危険度
              </h3>
              <div className="space-y-2">
                {safety.regional_risks.map((risk, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border p-3 ${regionalLevelColors[risk.level] ?? "border-white/10 bg-white/5 text-muted"}`}
                  >
                    <span className="shrink-0 rounded-md bg-current/10 px-2 py-0.5 text-xs font-bold">
                      Lv.{risk.level}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{risk.region}</p>
                      <p className="text-xs opacity-80">
                        {risk.description || regionalLevelLabels[risk.level] || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 外務省・安全対策リンク */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={safety.mofa_url || "https://www.anzen.mofa.go.jp/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 p-4 hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm font-semibold text-foreground">外務省 海外安全情報</span>
              </div>
              <ExternalLink className="h-4 w-4 text-accent shrink-0" />
            </a>
            {safety.safety_measure_url && (
              <a
                href={safety.safety_measure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl glass-card p-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-muted shrink-0" />
                  <span className="text-sm text-muted">安全対策基礎データ</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted shrink-0" />
              </a>
            )}
          </div>

          {/* 注意事項（領事メール以外） */}
          {safety.details.filter(d => d.category !== "領事メール").length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent" />
                注意事項
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {safety.details.filter(d => d.category !== "領事メール").map((detail, i) => (
                  <ExpandableDetailCard
                    key={i}
                    category={detail.category}
                    severityLabel={detail.severity === "low" ? "低" : detail.severity === "medium" ? "中" : "高"}
                    severityColor={severityColors[detail.severity] ?? "text-muted"}
                    description={detail.description}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 領事館からのお知らせ */}
          {safety.details.filter(d => d.category === "領事メール").length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
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
                          className="mt-0.5 h-4 w-4 shrink-0 text-accent transition-transform duration-200 group-open:rotate-90"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          {date && (
                            <span className="inline-block text-xs text-muted mb-1">{date}</span>
                          )}
                          <p className="text-sm text-foreground leading-snug">{title}</p>
                        </div>
                      </summary>
                      {body && (
                        <div className="px-4 pb-4 pl-11">
                          <p className="text-sm text-muted leading-relaxed">{body}</p>
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
        <p className="text-sm text-muted">安全情報を取得できませんでした</p>
      )}
    </>
  );
}
