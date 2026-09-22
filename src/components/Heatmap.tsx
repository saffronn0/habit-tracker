import { format, subDays } from "date-fns";
import { themeFor } from "@/lib/colors";

type Props = {
  completedDates: Set<string>;
  color: string;
  weeks?: number;
};

const SWATCH_SOLID: Record<string, string> = {
  violet: "bg-violet-500",
  blue: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
};

export default function Heatmap({ completedDates, color, weeks = 12 }: Props) {
  const days = weeks * 7;
  const today = new Date();
  // Build day list oldest -> newest, then chunk into week columns.
  const cells = Array.from({ length: days }, (_, i) => {
    const d = subDays(today, days - 1 - i);
    const key = format(d, "yyyy-MM-dd");
    return { key, done: completedDates.has(key) };
  });

  const columns: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  const solid = SWATCH_SOLID[color] ?? SWATCH_SOLID.violet;
  const theme = themeFor(color);

  return (
    <div className="flex gap-[3px]" aria-hidden>
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {col.map((cell) => (
            <div
              key={cell.key}
              title={cell.key}
              className={`h-2.5 w-2.5 rounded-[3px] transition-colors ${
                cell.done ? solid : `${theme.chipBg}`
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
