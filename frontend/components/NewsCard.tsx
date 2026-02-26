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
    <div className="rounded-xl glass-card-interactive p-4">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2"
      >
        <h3 className="flex-1 font-semibold text-sm text-foreground group-hover:text-accent transition-colors leading-snug">
          {article.title}
        </h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-accent mt-0.5" />
      </a>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <span>{article.source}</span>
        {date && (
          <>
            <span>&middot;</span>
            <span>{date}</span>
          </>
        )}
      </div>
      {article.description && (
        <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-3">
          {article.description}
        </p>
      )}
    </div>
  );
}
