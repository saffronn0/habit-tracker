"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { createHabit } from "@/lib/actions";
import { COLOR_KEYS, COLOR_THEMES, type ColorKey } from "@/lib/colors";

const EMOJI_PRESETS = [
  "💧", "🏃", "📚", "🧘", "🥗", "😴", "✍️", "💪", "🎸", "🧹", "🧠", "🚭",
];

export default function NewHabitDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_PRESETS[0]);
  const [color, setColor] = useState<ColorKey>("violet");
  const [pointStake, setPointStake] = useState(10);
  const [consequenceText, setConsequenceText] = useState("");

  function reset() {
    setName("");
    setEmoji(EMOJI_PRESETS[0]);
    setColor("violet");
    setPointStake(10);
    setConsequenceText("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createHabit({ name, emoji, color, pointStake, consequenceText });
      reset();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-accent px-4 py-2.5 text-sm font-semibold text-foreground shadow-md shadow-accent/30 transition-transform active:scale-[0.97]"
      >
        <Plus size={16} strokeWidth={3} />
        New habit
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">New habit</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-muted hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mb-1 block text-xs font-medium text-muted">Name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Drink 2L of water"
                maxLength={60}
                className="mb-4 w-full rounded-xl border border-card-border bg-transparent px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              />

              <label className="mb-1 block text-xs font-medium text-muted">Icon</label>
              <div className="mb-4 grid grid-cols-6 gap-1.5">
                {EMOJI_PRESETS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`rounded-xl py-1.5 text-lg transition-transform hover:scale-110 ${
                      emoji === e ? "bg-primary/25 ring-2 ring-accent" : ""
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <label className="mb-1 block text-xs font-medium text-muted">Color</label>
              <div className="mb-4 flex gap-2">
                {COLOR_KEYS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full ${COLOR_THEMES[c].swatch} transition-transform hover:scale-110 ${
                      color === c ? "ring-2 ring-offset-2 ring-offset-card ring-black/50 dark:ring-white/60" : ""
                    }`}
                  />
                ))}
              </div>

              <label className="mb-1 block text-xs font-medium text-muted">
                Points at stake per missed day: {pointStake}
              </label>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={pointStake}
                onChange={(e) => setPointStake(Number(e.target.value))}
                className="mb-4 w-full accent-accent"
              />

              <label className="mb-1 block text-xs font-medium text-muted">
                Consequence if you miss a day <span className="opacity-60">(optional)</span>
              </label>
              <textarea
                value={consequenceText}
                onChange={(e) => setConsequenceText(e.target.value)}
                placeholder="No gaming this weekend"
                maxLength={140}
                rows={2}
                className="mb-5 w-full resize-none rounded-xl border border-card-border bg-transparent px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              />

              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full rounded-xl bg-gradient-to-br from-primary to-accent py-2.5 text-sm font-semibold text-foreground shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {isPending ? "Creating…" : "Create habit"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
