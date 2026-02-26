"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  category: string;
  severityLabel: string;
  severityColor: string;
  description: string;
}

export default function ExpandableDetailCard({
  category,
  severityLabel,
  severityColor,
  description,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setClamped(el.scrollHeight > el.clientHeight);
    }
  }, [description]);

  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-foreground">
          {category}
        </span>
        <span className={`text-xs font-medium ${severityColor}`}>
          {severityLabel}
        </span>
      </div>
      <p
        ref={textRef}
        className={`text-sm text-muted leading-relaxed ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {description}
      </p>
      {clamped && (
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
