export type ColorKey =
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan";

export const COLOR_KEYS: ColorKey[] = [
  "violet",
  "blue",
  "emerald",
  "amber",
  "rose",
  "cyan",
];

type ColorTheme = {
  gradient: string;
  ring: string;
  text: string;
  chipBg: string;
  swatch: string;
};

export const COLOR_THEMES: Record<ColorKey, ColorTheme> = {
  violet: {
    gradient: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-400",
    text: "text-violet-600 dark:text-violet-300",
    chipBg: "bg-violet-100 dark:bg-violet-500/15",
    swatch: "bg-violet-500",
  },
  blue: {
    gradient: "from-sky-500 to-blue-500",
    ring: "ring-sky-400",
    text: "text-sky-600 dark:text-sky-300",
    chipBg: "bg-sky-100 dark:bg-sky-500/15",
    swatch: "bg-sky-500",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-400",
    text: "text-emerald-600 dark:text-emerald-300",
    chipBg: "bg-emerald-100 dark:bg-emerald-500/15",
    swatch: "bg-emerald-500",
  },
  amber: {
    gradient: "from-amber-400 to-orange-500",
    ring: "ring-amber-400",
    text: "text-amber-600 dark:text-amber-300",
    chipBg: "bg-amber-100 dark:bg-amber-500/15",
    swatch: "bg-amber-400",
  },
  rose: {
    gradient: "from-rose-500 to-pink-500",
    ring: "ring-rose-400",
    text: "text-rose-600 dark:text-rose-300",
    chipBg: "bg-rose-100 dark:bg-rose-500/15",
    swatch: "bg-rose-500",
  },
  cyan: {
    gradient: "from-cyan-500 to-blue-400",
    ring: "ring-cyan-400",
    text: "text-cyan-600 dark:text-cyan-300",
    chipBg: "bg-cyan-100 dark:bg-cyan-500/15",
    swatch: "bg-cyan-500",
  },
};

export function themeFor(color: string): ColorTheme {
  return COLOR_THEMES[(color as ColorKey) in COLOR_THEMES ? (color as ColorKey) : "violet"];
}
