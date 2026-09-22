"use client";

import { useState } from "react";
import type { WeekdayPoint } from "@/lib/insights";

const CHART_MARK = "#a78537";

export default function WeekdayBarChart({ data }: { data: WeekdayPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const maxRate = Math.max(...data.map((d) => d.rate), 1);
  const active = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="relative">
      <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 140 }}>
        {data.map((d, i) => {
          const barHeightPct = maxRate > 0 ? (d.rate / maxRate) * 100 : 0;
          return (
            <button
              key={d.weekday}
              type="button"
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1 rounded-lg outline-none"
              onPointerEnter={() => setActiveIndex(i)}
              onPointerLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
              aria-label={`${d.weekday}: ${d.rate}% completion, ${d.completed} of ${d.total}`}
            >
              <span className="text-[11px] font-semibold tabular-nums text-foreground">
                {d.total > 0 ? `${d.rate}%` : "—"}
              </span>
              <span
                className="w-full max-w-[22px] rounded-t-[4px] transition-[filter] group-hover:brightness-110 group-focus-visible:brightness-110"
                style={{
                  height: `${Math.max(barHeightPct, d.total > 0 ? 3 : 0)}%`,
                  backgroundColor: CHART_MARK,
                  minHeight: d.total > 0 ? 3 : 0,
                }}
              />
              <span className="text-[11px] text-muted">{d.weekday}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="glass-card pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-xs shadow-md">
          <div className="font-semibold">{active.weekday}</div>
          <div className="text-muted">
            {active.completed} / {active.total} habits done
          </div>
        </div>
      )}
    </div>
  );
}
