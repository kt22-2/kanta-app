import type { SafetyLevel } from "@/lib/types";
import { getSafetyColor, getSafetyLabel } from "@/lib/utils";

interface Props {
  level: SafetyLevel;
  label?: string;
  size?: "sm" | "md";
}

export default function SafetyBadge({ level, label, size = "sm" }: Props) {
  const colorClass = getSafetyColor(level);
  const displayLabel = label ?? getSafetyLabel(level);
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${colorClass} ${sizeClass}`}
    >
      {displayLabel}
    </span>
  );
}
