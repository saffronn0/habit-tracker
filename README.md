# Momentum — Habit Tracker

A clean, animated habit tracker with streaks, stats, and self-imposed stakes to keep you accountable.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite for storage
- Framer Motion for animation, canvas-confetti for celebrations

## Features

- Create habits with an emoji, color, and an optional daily point stake / consequence
- Check in daily; streaks and your longest streak are tracked automatically
- Points are earned for check-ins and docked automatically if a streak breaks overnight
- A mini calendar heatmap per habit shows recent history

## Getting started

```bash
npm install
npx prisma migrate dev   # creates the local SQLite database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data model

See `prisma/schema.prisma`:

- `Habit` — name, emoji, color, point stake, optional consequence text
- `HabitLog` — one row per habit per day it was completed
- `Profile` — a singleton row tracking total points

Streaks and points reconcile lazily: opening the dashboard checks whether yesterday
was missed for any habit and, if so, docks that habit's point stake exactly once
(`src/lib/actions.ts`, `reconcilePenalties`).
