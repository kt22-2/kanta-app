"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { WikiSummary } from "@/lib/types";

interface Props {
  wiki: WikiSummary;
}

export default function WikiSummaryCard({ wiki }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!wiki.available || !wiki.summary) return null;

  const SHORT_LENGTH = 180;
  const isLong = wiki.summary.length > SHORT_LENGTH;
  const displayText = expanded || !isLong
    ? wiki.summary
    : wiki.summary.slice(0, SHORT_LENGTH) + "…";

  return (
    <div className="rounded-xl glass-card p-5 border-l-2 border-l-accent/50">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4 text-accent shrink-0" />
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">概要</span>
        {wiki.url && (
          <a
            href={wiki.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
          >
            Wikipedia
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
        >
          {expanded ? (
            <>折りたたむ <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>続きを読む <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  );
}
