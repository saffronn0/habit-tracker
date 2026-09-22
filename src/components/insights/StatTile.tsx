type Props = {
  label: string;
  value: string;
  delta?: { text: string; good: boolean | null } | null;
  sublabel?: string;
};

export default function StatTile({ label, value, delta, sublabel }: Props) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold">{value}</span>
        {delta && (
          <span
            className={`text-xs font-semibold ${
              delta.good === null
                ? "text-muted"
                : delta.good
                  ? "text-[#0ca30c]"
                  : "text-[#d03b3b]"
            }`}
          >
            {delta.text}
          </span>
        )}
      </div>
      {sublabel && <div className="mt-0.5 text-xs text-muted">{sublabel}</div>}
    </div>
  );
}
