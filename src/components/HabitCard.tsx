"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Flame, Trash2 } from "lucide-react";
import { checkInHabit, undoCheckInHabit, deleteHabit } from "@/lib/actions";
import { themeFor } from "@/lib/colors";
import { isMilestone, type HabitStats } from "@/lib/streaks";
import Heatmap from "./Heatmap";

type HabitCardProps = {
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

export default function HabitCard({ habit, stats, completedDates }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevCompletedToday = useRef(stats.completedToday);
  const theme = themeFor(habit.color);

  useEffect(() => {
    if (!prevCompletedToday.current && stats.completedToday) {
      const el = buttonRef.current;
      const origin = el
        ? {
            x: (el.getBoundingClientRect().left + el.offsetWidth / 2) / window.innerWidth,
            y: (el.getBoundingClientRect().top + el.offsetHeight / 2) / window.innerHeight,
          }
        : { x: 0.5, y: 0.5 };

      if (isMilestone(stats.currentStreak)) {
        confetti({ particleCount: 140, spread: 90, origin, scalar: 1.1 });
        confetti({ particleCount: 60, spread: 130, origin, scalar: 0.8, startVelocity: 45 });
      } else {
        confetti({ particleCount: 40, spread: 55, origin, scalar: 0.8 });
      }
    }
    prevCompletedToday.current = stats.completedToday;
  }, [stats.completedToday, stats.currentStreak]);

  useEffect(() => {
    if (!confirmingDelete) return;
    const t = setTimeout(() => setConfirmingDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmingDelete]);

  function handleToggle() {
    startTransition(async () => {
      if (stats.completedToday) {
        await undoCheckInHabit(habit.id);
      } else {
        await checkInHabit(habit.id);
      }
    });
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteHabit(habit.id);
    });
  }

  const completedDateSet = new Set(completedDates);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="glass-card group relative flex flex-col gap-4 rounded-3xl p-5 shadow-sm"
    >
      <button
        onClick={handleDelete}
        aria-label={confirmingDelete ? "Confirm delete habit" : "Delete habit"}
        className={`absolute right-4 top-4 rounded-full p-1.5 opacity-0 transition-all group-hover:opacity-100 ${
          confirmingDelete
            ? "bg-red-500 text-white opacity-100"
            : "text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        }`}
      >
        <Trash2 size={15} />
      </button>

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl ${theme.gradient}`}
        >
          <span>{habit.emoji}</span>
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="font-display truncate text-base font-semibold">{habit.name}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            {stats.currentStreak > 0 ? (
              <span className="flex items-center gap-1">
                <Flame size={13} className={`animate-flame ${theme.text}`} />
                {stats.currentStreak} day{stats.currentStreak === 1 ? "" : "s"}
              </span>
            ) : (
              <span>No streak yet</span>
            )}
            <span aria-hidden>·</span>
            <span>best {stats.longestStreak}</span>
          </div>
        </div>
      </div>

      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isPending}
        className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-70 ${
          stats.completedToday
            ? `bg-gradient-to-br text-white shadow-md ${theme.gradient}`
            : `${theme.chipBg} ${theme.text} hover:brightness-95`
        }`}
      >
        <motion.span
          key={stats.completedToday ? "done" : "todo"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex items-center gap-2"
        >
          <Check size={16} strokeWidth={3} />
          {stats.completedToday ? "Done today" : "Mark done"}
        </motion.span>
      </button>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{habit.pointStake} pts at stake</span>
        <Heatmap completedDates={completedDateSet} color={habit.color} weeks={10} />
      </div>

      {habit.consequenceText && (
        <p className="truncate text-[11px] italic text-muted" title={habit.consequenceText}>
          If missed: {habit.consequenceText}
        </p>
      )}
    </motion.div>
  );
}
