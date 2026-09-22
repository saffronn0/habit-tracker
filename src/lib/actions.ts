"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { todayStr, yesterdayStr, dateStr } from "./dates";

const CHECKIN_REWARD = 2;

export async function getProfile() {
  return prisma.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", totalPoints: 0 },
  });
}

export type TriggeredPenalty = {
  habitName: string;
  emoji: string;
  pointStake: number;
  consequenceText: string | null;
};

// Runs on every dashboard load. For each habit, checks whether yesterday
// passed without a completed check-in and, if so, docks its point stake
// exactly once (guarded by lastPenaltyDate so reloading never double-charges).
export async function reconcilePenalties(): Promise<TriggeredPenalty[]> {
  const yesterday = yesterdayStr();
  const habits = await prisma.habit.findMany({
    where: { archived: false },
    include: { logs: { where: { date: yesterday } } },
  });

  const triggered: TriggeredPenalty[] = [];
  let totalDeduction = 0;

  for (const habit of habits) {
    const existedYesterday = dateStr(habit.createdAt) <= yesterday;
    const completedYesterday = habit.logs.some((l) => l.completed);
    const alreadyPenalized = habit.lastPenaltyDate === yesterday;

    if (existedYesterday && !completedYesterday && !alreadyPenalized) {
      await prisma.habit.update({
        where: { id: habit.id },
        data: { lastPenaltyDate: yesterday },
      });
      if (habit.pointStake > 0) {
        await prisma.pointsEntry.create({
          data: {
            date: yesterday,
            delta: -habit.pointStake,
            reason: "penalty",
            habitId: habit.id,
          },
        });
      }
      totalDeduction += habit.pointStake;
      triggered.push({
        habitName: habit.name,
        emoji: habit.emoji,
        pointStake: habit.pointStake,
        consequenceText: habit.consequenceText,
      });
    }
  }

  if (totalDeduction > 0) {
    const profile = await getProfile();
    await prisma.profile.update({
      where: { id: "singleton" },
      data: { totalPoints: Math.max(0, profile.totalPoints - totalDeduction) },
    });
  }

  return triggered;
}

export async function getDashboardData() {
  const triggered = await reconcilePenalties();
  const [habits, profile] = await Promise.all([
    prisma.habit.findMany({
      where: { archived: false },
      orderBy: { createdAt: "asc" },
      include: { logs: true },
    }),
    getProfile(),
  ]);
  return { habits, profile, triggered };
}

export async function createHabit(input: {
  name: string;
  emoji: string;
  color: string;
  pointStake: number;
  consequenceText?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Habit name is required");

  await prisma.habit.create({
    data: {
      name,
      emoji: input.emoji || "✨",
      color: input.color || "violet",
      pointStake: Math.max(0, Math.min(1000, input.pointStake || 10)),
      consequenceText: input.consequenceText?.trim() || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function checkInHabit(habitId: string) {
  const today = todayStr();
  await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date: today } },
    update: { completed: true },
    create: { habitId, date: today, completed: true },
  });

  const existingEntry = await prisma.pointsEntry.findFirst({
    where: { habitId, date: today, reason: "checkin" },
  });
  if (!existingEntry) {
    await prisma.pointsEntry.create({
      data: { habitId, date: today, delta: CHECKIN_REWARD, reason: "checkin" },
    });
    const profile = await getProfile();
    await prisma.profile.update({
      where: { id: "singleton" },
      data: { totalPoints: profile.totalPoints + CHECKIN_REWARD },
    });
  }
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function undoCheckInHabit(habitId: string) {
  const today = todayStr();
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date: today } },
  });
  if (existing?.completed) {
    await prisma.habitLog.delete({ where: { id: existing.id } });

    const entry = await prisma.pointsEntry.findFirst({
      where: { habitId, date: today, reason: "checkin" },
    });
    if (entry) {
      await prisma.pointsEntry.delete({ where: { id: entry.id } });
      const profile = await getProfile();
      await prisma.profile.update({
        where: { id: "singleton" },
        data: {
          totalPoints: Math.max(0, profile.totalPoints - CHECKIN_REWARD),
        },
      });
    }
  }
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function deleteHabit(habitId: string) {
  await prisma.habit.delete({ where: { id: habitId } });
  revalidatePath("/");
  revalidatePath("/insights");
}
