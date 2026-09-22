"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import type { TriggeredPenalty } from "@/lib/actions";

export default function PenaltyBanner({ items }: { items: TriggeredPenalty[] }) {
  const [dismissed, setDismissed] = useState(false);
  if (items.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="mb-6 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/30 dark:bg-rose-500/10"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />
          <div className="flex-1">
            <p className="font-display font-semibold text-rose-600 dark:text-rose-300">
              Streak{items.length > 1 ? "s" : ""} broken yesterday
            </p>
            <ul className="mt-2 space-y-1 text-rose-700 dark:text-rose-300/90">
              {items.map((item, i) => (
                <li key={i}>
                  {item.emoji} <strong>{item.habitName}</strong> — lost {item.pointStake} pts
                  {item.consequenceText ? `. Consequence: ${item.consequenceText}` : ""}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
