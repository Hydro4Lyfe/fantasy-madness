/*
  Warnings:

  - You are about to drop the column `team_id` on the `global_picks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[global_entry_id,bracket_slot_id]` on the table `global_picks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bracket_slot_id` to the `global_picks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "global_picks" DROP CONSTRAINT "global_picks_team_id_fkey";

-- DropIndex
DROP INDEX "ix_global_picks_team";

-- DropIndex
DROP INDEX "ux_global_picks_entry_team";

-- AlterTable
ALTER TABLE "global_picks" DROP COLUMN "team_id",
ADD COLUMN     "bracket_slot_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "bracket_slots" (
    "bracket_slot_id" UUID NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "quadrant" SMALLINT NOT NULL,
    "seed" SMALLINT NOT NULL,
    "assigned_team_id" TEXT,
    "play_in_game_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bracket_slots_pkey" PRIMARY KEY ("bracket_slot_id")
);

-- CreateTable
CREATE TABLE "bracket_slot_candidates" (
    "bracket_slot_candidate_id" UUID NOT NULL,
    "bracket_slot_id" UUID NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bracket_slot_candidates_pkey" PRIMARY KEY ("bracket_slot_candidate_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bracket_slots_play_in_game_id_key" ON "bracket_slots"("play_in_game_id");

-- CreateIndex
CREATE INDEX "ix_bracket_slots_tournament" ON "bracket_slots"("tournament_id");

-- CreateIndex
CREATE INDEX "ix_bracket_slots_assigned_team" ON "bracket_slots"("assigned_team_id");

-- CreateIndex
CREATE INDEX "ix_bracket_slots_playin_game" ON "bracket_slots"("play_in_game_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_bracket_slots_tournament_quadrant_seed" ON "bracket_slots"("tournament_id", "quadrant", "seed");

-- CreateIndex
CREATE INDEX "ix_bracket_slot_candidates_slot" ON "bracket_slot_candidates"("bracket_slot_id");

-- CreateIndex
CREATE INDEX "ix_bracket_slot_candidates_team" ON "bracket_slot_candidates"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_bracket_slot_candidates_slot_team" ON "bracket_slot_candidates"("bracket_slot_id", "team_id");

-- CreateIndex
CREATE INDEX "ix_global_picks_slot" ON "global_picks"("bracket_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_global_picks_entry_slot" ON "global_picks"("global_entry_id", "bracket_slot_id");

-- AddForeignKey
ALTER TABLE "bracket_slots" ADD CONSTRAINT "bracket_slots_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_slots" ADD CONSTRAINT "bracket_slots_assigned_team_id_fkey" FOREIGN KEY ("assigned_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_slots" ADD CONSTRAINT "bracket_slots_play_in_game_id_fkey" FOREIGN KEY ("play_in_game_id") REFERENCES "games"("game_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_slot_candidates" ADD CONSTRAINT "bracket_slot_candidates_bracket_slot_id_fkey" FOREIGN KEY ("bracket_slot_id") REFERENCES "bracket_slots"("bracket_slot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_slot_candidates" ADD CONSTRAINT "bracket_slot_candidates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_picks" ADD CONSTRAINT "global_picks_bracket_slot_id_fkey" FOREIGN KEY ("bracket_slot_id") REFERENCES "bracket_slots"("bracket_slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;
