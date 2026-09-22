import { prisma } from "./prisma";
import { getProfile } from "./actions";

export async function getInsightsRawData() {
  const habits = await prisma.habit.findMany({
    where: { archived: false },
    orderBy: { createdAt: "asc" },
    include: { logs: true },
  });
  const allPointsEntries = await prisma.pointsEntry.findMany({
    orderBy: { date: "asc" },
  });
  const profile = await getProfile();
  return { habits, allPointsEntries, profile };
}

export type InsightsRawData = Awaited<ReturnType<typeof getInsightsRawData>>;
