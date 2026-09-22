import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getDashboardData } from "@/lib/actions";
import { computeStats } from "@/lib/streaks";
import PointsBadge from "@/components/PointsBadge";
import NewHabitDialog from "@/components/NewHabitDialog";
import PenaltyBanner from "@/components/PenaltyBanner";
import HabitGrid from "@/components/HabitGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { habits, profile, triggered } = await getDashboardData();

  const items = habits.map((habit) => {
    const logs = habit.logs.map((l) => ({ date: l.date, completed: l.completed }));
    return {
      habit: {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        pointStake: habit.pointStake,
        consequenceText: habit.consequenceText,
      },
      stats: computeStats(logs),
      completedDates: logs.filter((l) => l.completed).map((l) => l.date),
    };
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display bg-gradient-to-r from-accent to-primary bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            Momentum
          </h1>
          <p className="text-sm text-muted">Show up daily. Keep your streak. Stay honest.</p>
        </div>
        <div className="flex items-center gap-3">
          <PointsBadge points={profile.totalPoints} />
          <Link
            href="/insights"
            className="glass-card flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Insights</span>
          </Link>
          <NewHabitDialog />
        </div>
      </header>

      <PenaltyBanner items={triggered} />

      <HabitGrid items={items} />
    </main>
  );
}
