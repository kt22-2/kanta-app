import Link from "next/link";
import { Compass, ExternalLink } from "lucide-react";

const NAV_LINKS = [
  { href: "/countries", label: "国一覧" },
  { href: "/journey", label: "KANTAの軌跡" },
  { href: "/countries?region=アジア", label: "アジア" },
  { href: "/countries?region=大洋州", label: "大洋州" },
  { href: "/countries?region=北米", label: "北米" },
  { href: "/countries?region=中南米", label: "中南米" },
  { href: "/countries?region=欧州", label: "欧州" },
  { href: "/countries?region=中東", label: "中東" },
  { href: "/countries?region=アフリカ", label: "アフリカ" },
];

const DATA_SOURCES = [
  { href: "https://restcountries.com", label: "REST Countries" },
  { href: "https://www.anzen.mofa.go.jp", label: "外務省海外安全情報" },
  { href: "https://opentripmap.io", label: "OpenTripMap" },
  { href: "https://gnews.io", label: "GNews" },
  { href: "https://open-meteo.com", label: "Open-Meteo" },
  { href: "https://data.worldbank.org", label: "World Bank" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/6">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* ロゴ・説明 */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Compass className="h-5 w-5 text-accent transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-bold text-lg tracking-widest text-foreground">
                KANTA TRAVEL🧳
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              世界一周旅行者のための情報ハブ。
              <br />
              安全情報・入国要件・観光スポットを
              まとめて確認できます。
            </p>
          </div>

          {/* ナビゲーション */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
              ナビゲーション
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* データソース */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
              データソース
            </h3>
            <ul className="space-y-2">
              {DATA_SOURCES.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
                  >
                    {source.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 免責・コピーライト */}
        <div className="mt-10 border-t border-white/6 pt-6">
          <p className="text-xs text-muted/70 leading-relaxed">
            ※ 本サイトの情報は参考情報です。渡航前に必ず外務省・大使館等の公式情報で最新の状況をご確認ください。
            掲載情報の正確性について一切の保証はいたしません。
          </p>
          <p className="mt-2 text-xs text-muted/50">
            &copy; {new Date().getFullYear()} KANTA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
