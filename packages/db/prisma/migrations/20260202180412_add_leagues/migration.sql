-- CreateEnum
CREATE TYPE "LeagueStatus" AS ENUM ('OPEN', 'LOCKED', 'COMPLETE');

-- CreateTable
CREATE TABLE "leagues" (
    "league_id" UUID NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LeagueStatus" NOT NULL DEFAULT 'OPEN',
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "invite_code" TEXT,
    "max_participants" INTEGER,
    "lock_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("league_id")
);

-- CreateTable
CREATE TABLE "league_entries" (
    "league_entry_id" UUID NOT NULL,
    "league_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_entries_pkey" PRIMARY KEY ("league_entry_id")
);

-- CreateTable
CREATE TABLE "league_picks" (
    "league_entry_id" UUID NOT NULL,
    "pick_no" SMALLINT NOT NULL,
    "bracket_slot_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_picks_pkey" PRIMARY KEY ("league_entry_id","pick_no")
);

-- CreateTable
CREATE TABLE "league_scores" (
    "league_entry_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "breakdown" JSONB,
    "last_recalc_at" TIMESTAMPTZ(6),

    CONSTRAINT "league_scores_pkey" PRIMARY KEY ("league_entry_id")
);

-- CreateTable
CREATE TABLE "league_bans" (
    "league_ban_id" UUID NOT NULL,
    "league_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT,
    "banned_by_user_id" TEXT NOT NULL,
    "banned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_bans_pkey" PRIMARY KEY ("league_ban_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ux_leagues_invite_code" ON "leagues"("invite_code");

-- CreateIndex
CREATE INDEX "ix_leagues_tournament_status" ON "leagues"("tournament_id", "status");

-- CreateIndex
CREATE INDEX "ix_leagues_public_status" ON "leagues"("is_private", "status");

-- CreateIndex
CREATE INDEX "ix_league_entries_user" ON "league_entries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_league_entries_league_user" ON "league_entries"("league_id", "user_id");

-- CreateIndex
CREATE INDEX "ix_league_picks_slot" ON "league_picks"("bracket_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_league_picks_entry_slot" ON "league_picks"("league_entry_id", "bracket_slot_id");

-- CreateIndex
CREATE INDEX "ix_league_scores_score" ON "league_scores"("score");

-- CreateIndex
CREATE INDEX "ix_league_bans_user" ON "league_bans"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_league_bans_league_user" ON "league_bans"("league_id", "user_id");

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_entries" ADD CONSTRAINT "league_entries_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_entries" ADD CONSTRAINT "league_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_picks" ADD CONSTRAINT "league_picks_league_entry_id_fkey" FOREIGN KEY ("league_entry_id") REFERENCES "league_entries"("league_entry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_picks" ADD CONSTRAINT "league_picks_bracket_slot_id_fkey" FOREIGN KEY ("bracket_slot_id") REFERENCES "bracket_slots"("bracket_slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_scores" ADD CONSTRAINT "league_scores_league_entry_id_fkey" FOREIGN KEY ("league_entry_id") REFERENCES "league_entries"("league_entry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_bans" ADD CONSTRAINT "league_bans_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_bans" ADD CONSTRAINT "league_bans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_bans" ADD CONSTRAINT "league_bans_banned_by_user_id_fkey" FOREIGN KEY ("banned_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
