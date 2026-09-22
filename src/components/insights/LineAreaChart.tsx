"use client";

import { useId, useMemo, useState } from "react";
import { format as formatDate, parseISO } from "date-fns";

type Point = { date: string; value: number };

type Props = {
  data: Point[];
  color: string;
  format?: "percent" | "points";
  yMinZero?: boolean;
};

function formatFor(format: "percent" | "points") {
  return (v: number) => (format === "percent" ? `${Math.round(v)}%` : `${Math.round(v)} pts`);
}

const VB_W = 600;
const VB_H = 180;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

export default function LineAreaChart({
  data,
  color,
  format = "points",
  yMinZero = true,
}: Props) {
  const formatValue = formatFor(format);
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { linePath, areaPath, points, yMax, yMin } = useMemo(() => {
    const values = data.map((d) => d.value);
    let max = Math.max(...values, 0);
    let min = yMinZero ? Math.min(0, ...values) : Math.min(...values);
    if (max === min) {
      max += 1;
      min -= 1;
    }
    const plotH = VB_H - PAD_TOP - PAD_BOTTOM;
    const xFor = (i: number) =>
      data.length > 1 ? (i / (data.length - 1)) * VB_W : VB_W / 2;
    const yFor = (v: number) =>
      PAD_TOP + plotH - ((v - min) / (max - min)) * plotH;

    const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d.value) }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const baseline = yFor(Math.max(min, 0));
    const area =
      pts.length > 0
        ? `M${pts[0].x},${baseline} ` +
          pts.map((p) => `L${p.x},${p.y}`).join(" ") +
          ` L${pts[pts.length - 1].x},${baseline} Z`
        : "";

    return { linePath: line, areaPath: area, points: pts, yMax: max, yMin: min };
  }, [data, yMinZero]);

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(fraction * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, idx)));
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="h-[140px] w-full overflow-visible sm:h-[180px]"
        role="img"
        aria-label="Line chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={0}
          x2={VB_W}
          y1={VB_H - PAD_BOTTOM}
          y2={VB_H - PAD_BOTTOM}
          stroke="var(--card-border)"
          strokeWidth={1}
        />

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              x2={hoveredPoint.x}
              y1={PAD_TOP}
              y2={VB_H - PAD_BOTTOM}
              stroke="var(--card-border)"
              strokeWidth={1}
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={5}
              fill={color}
              stroke="var(--card)"
              strokeWidth={2}
            />
          </>
        )}

        <rect
          x={0}
          y={0}
          width={VB_W}
          height={VB_H}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && hoveredPoint && (
        <div
          className="glass-card pointer-events-none absolute top-0 z-10 -translate-y-full rounded-lg px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(hoveredPoint.x / VB_W) * 100}%`,
            transform: `translate(-50%, -8px)`,
          }}
        >
          <div className="font-semibold tabular-nums">{formatValue(hovered.value)}</div>
          <div className="text-muted">{formatDate(parseISO(hovered.date), "MMM d")}</div>
        </div>
      )}

      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{data[0] ? formatDate(parseISO(data[0].date), "MMM d") : ""}</span>
        <span>
          {data[data.length - 1] ? formatDate(parseISO(data[data.length - 1].date), "MMM d") : ""}
        </span>
      </div>
      <span className="sr-only">
        Range from {formatValue(yMin)} to {formatValue(yMax)}
      </span>
    </div>
  );
}
