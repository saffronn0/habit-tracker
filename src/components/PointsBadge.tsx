"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function PointsBadge({ points }: { points: number }) {
  const prev = useRef(points);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (points !== prev.current) {
      setFlash(points > prev.current ? "up" : "down");
      prev.current = points;
      const t = setTimeout(() => setFlash(null), 700);
      return () => clearTimeout(t);
    }
  }, [points]);

  return (
    <div className="glass-card flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm">
      <Sparkles size={16} className="text-accent" />
      <motion.span
        key={points}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`font-display text-sm font-semibold tabular-nums transition-colors ${
          flash === "up" ? "text-emerald-500" : flash === "down" ? "text-rose-500" : ""
        }`}
      >
        {points}
      </motion.span>
      <span className="text-xs text-muted">pts</span>
    </div>
  );
}
