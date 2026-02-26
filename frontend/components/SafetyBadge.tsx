import type { SafetyLevel } from "@/lib/types";
import { getSafetyColor, getSafetyLabel } from "@/lib/utils";

interface Props {
  level: SafetyLevel;
  label?: string;
  size?: "sm" | "md";
}

const GLOW_SHADOW: Record<number, string> = {
  0: "0 0 12px rgba(74,222,128,0.25)",
  1: "0 0 12px rgba(74,222,128,0.25)",
  2: "0 0 12px rgba(251,191,36,0.25)",
  3: "0 0 12px rgba(248,113,113,0.25)",
  4: "0 0 14px rgba(248,113,113,0.35)",
};

export default function SafetyBadge({ level, label, size = "sm" }: Props) {
  const colorClass = getSafetyColor(level);
  const displayLabel = label ?? getSafetyLabel(level);
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${colorClass} ${sizeClass}`}
      style={{ boxShadow: GLOW_SHADOW[level] ?? "none" }}
    >
      {displayLabel}
    </span>
  );
}
