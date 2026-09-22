import { AlertCircle, AlertTriangle, CheckCircle2, Sparkle, Flame } from "lucide-react";
import type { HabitPerformance, PerformanceTier } from "@/lib/insights";

const TIER_META: Record<
  PerformanceTier,
  { color: string; label: string; icon: typeof CheckCircle2 }
> = {
  good: { color: "#0ca30c", label: "On track", icon: CheckCircle2 },
  warning: { color: "#c98500", label: "Slipping", icon: AlertTriangle },
  critical: { color: "#d03b3b", label: "At risk", icon: AlertCircle },
  new: { color: "#8b8060", label: "New", icon: Sparkle },
};

export default function HabitPerformanceList({ items }: { items: HabitPerformance[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No habits in this range yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const meta = TIER_META[item.tier];
        const Icon = meta.icon;
        return (
          <li key={item.habitId}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span aria-hidden>{item.emoji}</span>
                <span className="truncate text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: meta.color }}>
                  <Icon size={13} />
                  {meta.label}
                </span>
                {item.currentStreak > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted">
                    <Flame size={12} className="text-accent" />
                    {item.currentStreak}
                  </span>
                )}
                <span className="w-9 text-right text-xs font-semibold tabular-nums">
                  {item.completionRate}%
                </span>
              </div>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--card-border)" }}
              role="img"
              aria-label={`${item.name}: ${item.completionRate}% completion, ${meta.label}`}
            >
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.max(item.completionRate, item.daysTracked > 0 ? 3 : 0)}%`,
                  backgroundColor: meta.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
