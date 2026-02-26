import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/lib/types";

interface Props {
  article: NewsArticle;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export default function NewsCard({ article }: Props) {
  const date = formatDate(article.published_at);

  return (
    <div className="rounded-xl glass-card gradient-border-hover p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(200,169,110,0.12)]">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2"
      >
        <h3 className="flex-1 font-semibold text-sm text-[#F5F5F0] group-hover:text-[#C8A96E] transition-colors leading-snug">
          {article.title}
        </h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-[#8899AA] group-hover:text-[#C8A96E] mt-0.5" />
      </a>
      <div className="mt-2 flex items-center gap-2 text-xs text-[#8899AA]">
        <span>{article.source}</span>
        {date && (
          <>
            <span>·</span>
            <span>{date}</span>
          </>
        )}
      </div>
      {article.description && (
        <p className="mt-2 text-sm text-[#8899AA] leading-relaxed line-clamp-3">
          {article.description}
        </p>
      )}
    </div>
  );
}
