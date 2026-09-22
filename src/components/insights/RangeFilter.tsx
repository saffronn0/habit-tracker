import Link from "next/link";

const PRESETS = [
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
  { days: 180, label: "Last 180 days" },
];

export default function RangeFilter({ current }: { current: number }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <Link
          key={p.days}
          href={`/insights?range=${p.days}`}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            current === p.days
              ? "bg-gradient-to-br from-primary to-accent text-foreground shadow-sm"
              : "glass-card text-muted hover:text-foreground"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
