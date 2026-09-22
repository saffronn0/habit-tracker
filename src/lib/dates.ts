import { format, parseISO, subDays, differenceInCalendarDays } from "date-fns";

export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function dateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function yesterdayStr(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

export function daysAgoStr(n: number): string {
  return format(subDays(new Date(), n), "yyyy-MM-dd");
}

export { parseISO, subDays, differenceInCalendarDays };
