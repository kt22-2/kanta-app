import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Icon className="h-8 w-8 text-accent/60" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
