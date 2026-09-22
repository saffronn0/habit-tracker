import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInsightsRawData } from "@/lib/insights-data";
import {
  buildDateRange,
  dailyCompletionSeries,
  overallCompletionRate,
  pointsCumulativeSeries,
  netPointsInRange,
  dayOfWeekBreakdown,
  perHabitPerformance,
} from "@/lib/insights";
import RangeFilter from "@/components/insights/RangeFilter";
import StatTile from "@/components/insights/StatTile";
import ChartCard from "@/components/insights/ChartCard";
import LineAreaChart from "@/components/insights/LineAreaChart";
import WeekdayBarChart from "@/components/insights/WeekdayBarChart";
import HabitPerformanceList from "@/components/insights/HabitPerformanceList";
import TableToggle from "@/components/insights/TableToggle";

export const dynamic = "force-dynamic";

const VALID_RANGES = [30, 90, 180];

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const parsed = parseInt(params.range ?? "30", 10);
  const days = VALID_RANGES.includes(parsed) ? parsed : 30;

  const { habits, allPointsEntries } = await getInsightsRawData();

  const range = buildDateRange(days);
  const prevRange = buildDateRange(days, days);

  const dailySeries = dailyCompletionSeries(habits, range);
  const overallRate = overallCompletionRate(habits, range);
  const prevOverallRate = overallCompletionRate(habits, prevRange);
  const rateDelta = overallRate - prevOverallRate;

  const pointsSeries = pointsCumulativeSeries(allPointsEntries, range);
  const netPoints = netPointsInRange(allPointsEntries, range);

  const weekdayData = dayOfWeekBreakdown(habits, range);
  const performance = perHabitPerformance(habits, range);

  const topHabit = performance.find((p) => p.daysTracked > 0);
  const longestCurrentStreak = performance.reduce(
    (max, p) => Math.max(max, p.currentStreak),
    0
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to habits
        </Link>
        <h1 className="font-display bg-gradient-to-r from-accent to-primary bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          Insights
        </h1>
        <p className="text-sm text-muted">
          Trends across your habits — what&rsquo;s working, and what isn&rsquo;t.
        </p>
      </div>

      <RangeFilter current={days} />

      {habits.length === 0 ? (
        <div className="glass-card rounded-3xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">Nothing to show yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Add a habit and start checking in — insights will show up here once there&rsquo;s
            data to learn from.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label={`Completion (${days}d)`}
              value={`${overallRate}%`}
              delta={{
                text: `${rateDelta >= 0 ? "+" : ""}${rateDelta}pp vs prior`,
                good: rateDelta === 0 ? null : rateDelta > 0,
              }}
            />
            <StatTile
              label={`Net points (${days}d)`}
              value={`${netPoints >= 0 ? "+" : ""}${netPoints}`}
              delta={netPoints === 0 ? null : { text: netPoints > 0 ? "gaining" : "losing", good: netPoints > 0 }}
            />
            <StatTile label="Longest active streak" value={`${longestCurrentStreak}d`} />
            <StatTile
              label="Most consistent"
              value={topHabit ? `${topHabit.completionRate}%` : "—"}
              sublabel={topHabit ? `${topHabit.emoji} ${topHabit.name}` : "No data yet"}
            />
          </div>

          <ChartCard
            title="Daily completion rate"
            subtitle={`Share of active habits completed each day, last ${days} days`}
          >
            <LineAreaChart
              data={dailySeries.map((d) => ({ date: d.date, value: d.rate }))}
              color="#a78537"
              format="percent"
            />
            <TableToggle
              columns={["Date", "Completed", "Active habits", "Rate"]}
              rows={dailySeries.map((d) => [d.date, d.completed, d.total, `${d.rate}%`])}
            />
          </ChartCard>

          <ChartCard title="Points balance" subtitle="Running total, including check-ins and stakes lost">
            <LineAreaChart
              data={pointsSeries.map((d) => ({ date: d.date, value: d.balance }))}
              color="#a78537"
              yMinZero={false}
              format="points"
            />
            <TableToggle
              columns={["Date", "Change", "Balance"]}
              rows={pointsSeries
                .filter((d) => d.delta !== 0)
                .map((d) => [d.date, d.delta > 0 ? `+${d.delta}` : d.delta, d.balance])}
            />
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Best & worst days"
              subtitle="Completion rate by day of week"
            >
              <WeekdayBarChart data={weekdayData} />
              <TableToggle
                columns={["Day", "Completed", "Active habits", "Rate"]}
                rows={weekdayData.map((d) => [d.weekday, d.completed, d.total, `${d.rate}%`])}
              />
            </ChartCard>

            <ChartCard
              title="What's working vs not"
              subtitle={`Completion rate per habit, last ${days} days`}
            >
              <HabitPerformanceList items={performance} />
            </ChartCard>
          </div>
        </div>
      )}
    </main>
  );
}
