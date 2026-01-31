-- AlterTable
ALTER TABLE "draft_picks" ADD COLUMN     "is_auto_pick" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "draft_turn_timers" (
    "draft_id" UUID NOT NULL,
    "turn_started_at" TIMESTAMPTZ(6) NOT NULL,
    "current_pick_number" INTEGER NOT NULL,
    "deadline_at" TIMESTAMPTZ(6) NOT NULL,
    "timer_paused_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "draft_turn_timers_pkey" PRIMARY KEY ("draft_id")
);

-- CreateIndex
CREATE INDEX "ix_draft_turn_timers_deadline" ON "draft_turn_timers"("deadline_at");

-- AddForeignKey
ALTER TABLE "draft_turn_timers" ADD CONSTRAINT "draft_turn_timers_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;
