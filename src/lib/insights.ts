import { format, subDays, parseISO } from "date-fns";
import { todayStr } from "./dates";
import { computeStats } from "./streaks";
import type { InsightsRawData } from "./insights-data";

type Habit = InsightsRawData["habits"][number];
type Entry = InsightsRawData["allPointsEntries"][number];

export function buildDateRange(days: number, endOffset = 0): string[] {
  const end = subDays(parseISO(todayStr()), endOffset);
  return Array.from({ length: days }, (_, i) =>
    format(subDays(end, days - 1 - i), "yyyy-MM-dd")
  );
}

function habitExistedOn(habit: Habit, date: string): boolean {
  return format(habit.createdAt, "yyyy-MM-dd") <= date;
}

export type DailyPoint = { date: string; rate: number; completed: number; total: number };

export function dailyCompletionSeries(habits: Habit[], range: string[]): DailyPoint[] {
  return range.map((date) => {
    const active = habits.filter((h) => habitExistedOn(h, date));
    const completed = active.filter((h) =>
      h.logs.some((l) => l.date === date && l.completed)
    ).length;
    return {
      date,
      total: active.length,
      completed,
      rate: active.length ? Math.round((completed / active.length) * 100) : 0,
    };
  });
}

export function overallCompletionRate(habits: Habit[], range: string[]): number {
  let completed = 0;
  let total = 0;
  for (const date of range) {
    const active = habits.filter((h) => habitExistedOn(h, date));
    total += active.length;
    completed += active.filter((h) =>
      h.logs.some((l) => l.date === date && l.completed)
    ).length;
  }
  return total ? Math.round((completed / total) * 100) : 0;
}

export type PointsPoint = { date: string; balance: number; delta: number };

export function pointsCumulativeSeries(entries: Entry[], range: string[]): PointsPoint[] {
  const rangeStart = range[0];
  let runningTotal = entries
    .filter((e) => e.date < rangeStart)
    .reduce((sum, e) => sum + e.delta, 0);

  const byDate = new Map<string, number>();
  for (const e of entries) {
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.delta);
  }

  return range.map((date) => {
    const delta = byDate.get(date) ?? 0;
    runningTotal += delta;
    return { date, balance: runningTotal, delta };
  });
}

export function netPointsInRange(entries: Entry[], range: string[]): number {
  const rangeSet = new Set(range);
  return entries
    .filter((e) => rangeSet.has(e.date))
    .reduce((sum, e) => sum + e.delta, 0);
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type WeekdayPoint = {
  weekday: string;
  rate: number;
  completed: number;
  total: number;
};

export function dayOfWeekBreakdown(habits: Habit[], range: string[]): WeekdayPoint[] {
  const buckets = WEEKDAY_LABELS.map((label) => ({
    weekday: label,
    completed: 0,
    total: 0,
    rate: 0,
  }));

  for (const date of range) {
    const dow = parseISO(date).getDay();
    const active = habits.filter((h) => habitExistedOn(h, date));
    buckets[dow].total += active.length;
    buckets[dow].completed += active.filter((h) =>
      h.logs.some((l) => l.date === date && l.completed)
    ).length;
  }

  for (const b of buckets) {
    b.rate = b.total ? Math.round((b.completed / b.total) * 100) : 0;
  }
  return buckets;
}

export type PerformanceTier = "new" | "good" | "warning" | "critical";

export type HabitPerformance = {
  habitId: string;
  name: string;
  emoji: string;
  completionRate: number;
  daysTracked: number;
  currentStreak: number;
  longestStreak: number;
  tier: PerformanceTier;
};

export function tierFor(rate: number, daysTracked: number): PerformanceTier {
  if (daysTracked < 3) return "new";
  if (rate >= 70) return "good";
  if (rate >= 40) return "warning";
  return "critical";
}

export function perHabitPerformance(habits: Habit[], range: string[]): HabitPerformance[] {
  const results = habits.map((habit) => {
    const trackedDates = range.filter((d) => habitExistedOn(habit, d));
    const completed = trackedDates.filter((d) =>
      habit.logs.some((l) => l.date === d && l.completed)
    ).length;
    const completionRate = trackedDates.length
      ? Math.round((completed / trackedDates.length) * 100)
      : 0;
    const stats = computeStats(
      habit.logs.map((l) => ({ date: l.date, completed: l.completed }))
    );
    return {
      habitId: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      completionRate,
      daysTracked: trackedDates.length,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      tier: tierFor(completionRate, trackedDates.length),
    };
  });
  return results.sort((a, b) => b.completionRate - a.completionRate);
}
