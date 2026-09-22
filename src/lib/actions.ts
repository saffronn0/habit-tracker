"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { todayStr, yesterdayStr, dateStr } from "./dates";

const CHECKIN_REWARD = 2;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getProfile(userId: string) {
  return prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId, totalPoints: 0 },
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
export async function reconcilePenalties(userId: string): Promise<TriggeredPenalty[]> {
  const yesterday = yesterdayStr();
  const habits = await prisma.habit.findMany({
    where: { userId, archived: false },
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
            userId,
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
    const profile = await getProfile(userId);
    await prisma.profile.update({
      where: { userId },
      data: { totalPoints: Math.max(0, profile.totalPoints - totalDeduction) },
    });
  }

  return triggered;
}

export async function getDashboardData() {
  const userId = await requireUserId();
  const triggered = await reconcilePenalties(userId);
  const [habits, profile] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, archived: false },
      orderBy: { createdAt: "asc" },
      include: { logs: true },
    }),
    getProfile(userId),
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
  const userId = await requireUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Habit name is required");

  await prisma.habit.create({
    data: {
      userId,
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
  const userId = await requireUserId();
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new Error("Habit not found");

  const today = todayStr();
  const [, existingEntry] = await Promise.all([
    prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date: today } },
      update: { completed: true },
      create: { habitId, date: today, completed: true },
    }),
    prisma.pointsEntry.findFirst({ where: { habitId, date: today, reason: "checkin" } }),
  ]);

  if (!existingEntry) {
    await Promise.all([
      prisma.pointsEntry.create({
        data: { userId, habitId, date: today, delta: CHECKIN_REWARD, reason: "checkin" },
      }),
      prisma.profile.upsert({
        where: { userId },
        update: { totalPoints: { increment: CHECKIN_REWARD } },
        create: { userId, totalPoints: CHECKIN_REWARD },
      }),
    ]);
  }
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function undoCheckInHabit(habitId: string) {
  const userId = await requireUserId();
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new Error("Habit not found");

  const today = todayStr();
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date: today } },
  });
  if (existing?.completed) {
    const [, entry] = await Promise.all([
      prisma.habitLog.delete({ where: { id: existing.id } }),
      prisma.pointsEntry.findFirst({ where: { habitId, date: today, reason: "checkin" } }),
    ]);
    if (entry) {
      await Promise.all([
        prisma.pointsEntry.delete({ where: { id: entry.id } }),
        prisma.profile.update({
          where: { userId },
          data: { totalPoints: { decrement: CHECKIN_REWARD } },
        }),
      ]);
    }
  }
  revalidatePath("/");
  revalidatePath("/insights");
}

export async function deleteHabit(habitId: string) {
  const userId = await requireUserId();
  await prisma.habit.deleteMany({ where: { id: habitId, userId } });
  revalidatePath("/");
  revalidatePath("/insights");
}
