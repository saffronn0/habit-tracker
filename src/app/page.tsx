import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getDashboardData } from "@/lib/actions";
import { computeStats } from "@/lib/streaks";
import { auth } from "@/lib/auth";
import PointsBadge from "@/components/PointsBadge";
import NewHabitDialog from "@/components/NewHabitDialog";
import PenaltyBanner from "@/components/PenaltyBanner";
import HabitGrid from "@/components/HabitGrid";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ habits, profile, triggered }, session] = await Promise.all([
    getDashboardData(),
    auth(),
  ]);

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
      <header className="mb-8 flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="font-display bg-gradient-to-r from-accent to-primary bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Habit Tracker
          </h1>
          <p className="mt-1 text-sm text-muted">Show up daily. Keep your streak. Stay honest.</p>
          {session?.user?.email && (
            <p className="mt-0.5 text-xs text-muted opacity-70">{session.user.email}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PointsBadge points={profile.totalPoints} />
          <Link
            href="/insights"
            className="glass-card flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Insights</span>
          </Link>
          <NewHabitDialog />
          <SignOutButton />
        </div>
      </header>

      <PenaltyBanner items={triggered} />

      <HabitGrid items={items} />
    </main>
  );
}
