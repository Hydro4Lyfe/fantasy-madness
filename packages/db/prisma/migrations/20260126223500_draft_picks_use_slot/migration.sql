-- Breaking change: DraftPick now references BracketSlot instead of Team
-- Clear existing draft picks since we're changing the foreign key relationship
DELETE FROM "draft_picks";

-- DropForeignKey
ALTER TABLE "draft_picks" DROP CONSTRAINT "draft_picks_team_id_fkey";

-- DropIndex
DROP INDEX "ix_draft_picks_team";

-- DropIndex
DROP INDEX "ux_draft_picks_draft_team";

-- AlterTable
ALTER TABLE "draft_picks" DROP COLUMN "team_id",
ADD COLUMN     "bracket_slot_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "ix_draft_picks_slot" ON "draft_picks"("bracket_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_draft_picks_draft_slot" ON "draft_picks"("draft_id", "bracket_slot_id");

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_bracket_slot_id_fkey" FOREIGN KEY ("bracket_slot_id") REFERENCES "bracket_slots"("bracket_slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;
