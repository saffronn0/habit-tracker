-- CreateTable
CREATE TABLE "points_entries" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "habitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "points_entries_date_idx" ON "points_entries"("date");

-- AddForeignKey
ALTER TABLE "points_entries" ADD CONSTRAINT "points_entries_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
