"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

      <div className="flex flex-col items-center gap-1.5 py-1">
        <div className="relative">
          <AnimatePresence>
            {stats.completedToday && (
              <motion.span
                key="ripple"
                initial={{ scale: 0.6, opacity: 0.55 }}
                animate={{ scale: 2.1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradient}`}
              />
            )}
          </AnimatePresence>

          <motion.button
            ref={buttonRef}
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={stats.completedToday}
            aria-label={stats.completedToday ? "Mark not done" : "Mark done"}
            whileTap={{ scale: 0.86 }}
            animate={stats.completedToday ? { scale: [1, 1.22, 1] } : { scale: 1 }}
            transition={
              stats.completedToday
                ? { scale: { duration: 0.42, times: [0, 0.45, 1], ease: "easeOut" } }
                : { type: "spring", stiffness: 420, damping: 14 }
            }
            className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-colors disabled:opacity-70 ${
              stats.completedToday
                ? `bg-gradient-to-br text-white shadow-lg ${theme.gradient}`
                : `${theme.chipBg} ${theme.text} shadow-sm hover:brightness-95`
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {stats.completedToday ? (
                <motion.svg
                  key="check"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.path
                    d="M4 12.5L9.5 18L20 6"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                  />
                </motion.svg>
              ) : (
                <motion.span
                  key="plus"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={26} strokeWidth={2.5} className="opacity-40" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        <span className="text-xs font-medium text-muted">
          {stats.completedToday ? "Done today" : "Mark done"}
        </span>
      </div>

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
