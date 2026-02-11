-- BallDontLie API Migration
-- This migration converts the schema from Sportradar (text team IDs) to BallDontLie (integer team IDs)
-- WARNING: This is a destructive migration that clears tournament/team/game data

-- Step 1: Drop dependent data (user picks, scores, etc. that reference teams/games)
DELETE FROM "draft_picks";
DELETE FROM "draft_scores";
DELETE FROM "draft_turn_timers";
DELETE FROM "draft_participants";
DELETE FROM "draft_invites";
DELETE FROM "drafts";

DELETE FROM "league_picks";
DELETE FROM "league_scores";
DELETE FROM "league_bans";
DELETE FROM "league_entries";
DELETE FROM "leagues";

DELETE FROM "global_picks";
DELETE FROM "global_scores";
DELETE FROM "global_entries";
DELETE FROM "global_contests";

DELETE FROM "bracket_slot_candidates";
DELETE FROM "bracket_slots";

DELETE FROM "sync_logs";
DELETE FROM "team_tournament_stats";
DELETE FROM "games";
DELETE FROM "tournament_teams";
DELETE FROM "teams";
DELETE FROM "tournaments";

-- Step 2: Update SyncFeedType enum
-- First, drop the column that uses the enum (data already deleted above)
ALTER TABLE "sync_logs" DROP COLUMN "feed_type";

-- Drop and recreate the enum
DROP TYPE "SyncFeedType";
CREATE TYPE "SyncFeedType" AS ENUM ('BRACKET', 'TEAMS', 'GAMES');

-- Re-add the column with the new enum
ALTER TABLE "sync_logs" ADD COLUMN "feed_type" "SyncFeedType" NOT NULL;

-- Step 3: Drop ALL foreign key constraints that reference teams.team_id
ALTER TABLE "tournament_teams" DROP CONSTRAINT IF EXISTS "tournament_teams_team_id_fkey";
ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_home_team_id_fkey";
ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_away_team_id_fkey";
ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_winner_team_id_fkey";
ALTER TABLE "team_tournament_stats" DROP CONSTRAINT IF EXISTS "team_tournament_stats_team_id_fkey";
ALTER TABLE "bracket_slots" DROP CONSTRAINT IF EXISTS "bracket_slots_assigned_team_id_fkey";
ALTER TABLE "bracket_slot_candidates" DROP CONSTRAINT IF EXISTS "bracket_slot_candidates_team_id_fkey";

-- Step 4: Drop primary keys that need to change
ALTER TABLE "teams" DROP CONSTRAINT "teams_pkey";
ALTER TABLE "tournament_teams" DROP CONSTRAINT "tournament_teams_pkey";
ALTER TABLE "team_tournament_stats" DROP CONSTRAINT "team_tournament_stats_pkey";

-- Step 5: Alter teams table
-- Drop old columns and indexes
DROP INDEX IF EXISTS "ix_teams_alias";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "alias";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "market";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "base_team_raw";

-- Change team_id from text to integer
ALTER TABLE "teams" ALTER COLUMN "team_id" TYPE INTEGER USING "team_id"::integer;

-- Add new columns
ALTER TABLE "teams" ADD COLUMN "full_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "teams" ADD COLUMN "college" TEXT;
ALTER TABLE "teams" ADD COLUMN "abbreviation" TEXT;
ALTER TABLE "teams" ADD COLUMN "conference_id" INTEGER;
ALTER TABLE "teams" ADD COLUMN "payload_raw" JSONB;

-- Remove default after adding column
ALTER TABLE "teams" ALTER COLUMN "full_name" DROP DEFAULT;

-- Re-add primary key
ALTER TABLE "teams" ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id");

-- Create new indexes
CREATE INDEX "ix_teams_abbreviation" ON "teams"("abbreviation");
CREATE INDEX "ix_teams_conference" ON "teams"("conference_id");

-- Step 6: Alter tournament_teams table
ALTER TABLE "tournament_teams" ALTER COLUMN "team_id" TYPE INTEGER USING "team_id"::integer;
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("tournament_id", "team_id");
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Alter bracket_slots table
ALTER TABLE "bracket_slots" ALTER COLUMN "assigned_team_id" TYPE INTEGER USING "assigned_team_id"::integer;
ALTER TABLE "bracket_slots" ADD CONSTRAINT "bracket_slots_assigned_team_id_fkey" FOREIGN KEY ("assigned_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 8: Alter bracket_slot_candidates table
ALTER TABLE "bracket_slot_candidates" ALTER COLUMN "team_id" TYPE INTEGER USING "team_id"::integer;
ALTER TABLE "bracket_slot_candidates" ADD CONSTRAINT "bracket_slot_candidates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Alter games table
-- Drop old columns and indexes
DROP INDEX IF EXISTS "ix_games_tournament_roundseq";
ALTER TABLE "games" DROP COLUMN IF EXISTS "round_seq";
ALTER TABLE "games" DROP COLUMN IF EXISTS "home_points";
ALTER TABLE "games" DROP COLUMN IF EXISTS "away_points";
ALTER TABLE "games" DROP COLUMN IF EXISTS "closed_at";

-- Alter round column from text to smallint
ALTER TABLE "games" ALTER COLUMN "round" TYPE SMALLINT USING NULL;

-- Add new columns
ALTER TABLE "games" ADD COLUMN "bracket_location" SMALLINT;
ALTER TABLE "games" ADD COLUMN "period_detail" TEXT;
ALTER TABLE "games" ADD COLUMN "home_score" INTEGER;
ALTER TABLE "games" ADD COLUMN "away_score" INTEGER;

-- Alter team ID columns
ALTER TABLE "games" ALTER COLUMN "home_team_id" TYPE INTEGER USING "home_team_id"::integer;
ALTER TABLE "games" ALTER COLUMN "away_team_id" TYPE INTEGER USING "away_team_id"::integer;
ALTER TABLE "games" ALTER COLUMN "winner_team_id" TYPE INTEGER USING "winner_team_id"::integer;

-- Re-add foreign keys for games
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "games" ADD CONSTRAINT "games_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create new index for round
CREATE INDEX "ix_games_tournament_round" ON "games"("tournament_id", "round");

-- Step 10: Alter team_tournament_stats table
ALTER TABLE "team_tournament_stats" ALTER COLUMN "team_id" TYPE INTEGER USING "team_id"::integer;
ALTER TABLE "team_tournament_stats" ADD CONSTRAINT "team_tournament_stats_pkey" PRIMARY KEY ("tournament_id", "team_id");
ALTER TABLE "team_tournament_stats" ADD CONSTRAINT "team_tournament_stats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;
