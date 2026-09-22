"use client";

import { AnimatePresence, motion } from "framer-motion";
import HabitCard from "./HabitCard";
import type { HabitStats } from "@/lib/streaks";

type Item = {
  habit: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    pointStake: number;
    consequenceText: string | null;
  };
  stats: HabitStats;
  completedDates: string[];
};

export default function HabitGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card flex flex-col items-center gap-2 rounded-3xl px-6 py-16 text-center"
      >
        <span className="text-4xl">🌱</span>
        <p className="font-display text-lg font-semibold">No habits yet</p>
        <p className="max-w-xs text-sm text-muted">
          Add your first habit to start building a streak — and put a little something on the
          line to keep yourself honest.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map(({ habit, stats, completedDates }) => (
          <HabitCard key={habit.id} habit={habit} stats={stats} completedDates={completedDates} />
        ))}
      </AnimatePresence>
    </div>
  );
}
