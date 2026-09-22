import { format, parseISO, subDays } from "date-fns";
import { todayStr } from "./dates";

export type LogLike = { date: string; completed: boolean };

export type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  totalCompletions: number;
};

export function computeStats(logs: LogLike[]): HabitStats {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );
  const today = todayStr();
  const completedToday = completedDates.has(today);

  // Current streak: count consecutive completed days walking backward from
  // today. If today isn't done yet, start from yesterday so an in-progress
  // day doesn't zero out an otherwise-intact streak.
  let currentStreak = 0;
  let cursor = completedToday ? parseISO(today) : subDays(parseISO(today), 1);
  while (completedDates.has(format(cursor, "yyyy-MM-dd"))) {
    currentStreak++;
    cursor = subDays(cursor, 1);
  }

  // Longest streak: scan all completed dates sorted ascending for the
  // longest run of consecutive calendar days.
  const sorted = [...completedDates].sort();
  let longestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    const cur = parseISO(d);
    if (prev) {
      const gap = (cur.getTime() - prev.getTime()) / 86400000;
      run = gap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prev = cur;
  }

  return {
    currentStreak,
    longestStreak,
    completedToday,
    totalCompletions: completedDates.size,
  };
}

export const MILESTONES = [7, 14, 30, 50, 100, 200, 365];

export function isMilestone(streak: number): boolean {
  return MILESTONES.includes(streak);
}
