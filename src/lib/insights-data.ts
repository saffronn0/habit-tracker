import { prisma } from "./prisma";
import { auth } from "./auth";
import { getProfile } from "./actions";

export async function getInsightsRawData() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const habits = await prisma.habit.findMany({
    where: { userId, archived: false },
    orderBy: { createdAt: "asc" },
    include: { logs: true },
  });
  const allPointsEntries = await prisma.pointsEntry.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  const profile = await getProfile(userId);
  return { habits, allPointsEntries, profile };
}

export type InsightsRawData = Awaited<ReturnType<typeof getInsightsRawData>>;
