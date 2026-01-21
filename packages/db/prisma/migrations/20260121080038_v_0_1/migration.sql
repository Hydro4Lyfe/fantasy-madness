-- CreateEnum
CREATE TYPE "TournamentSyncState" AS ENUM ('DISCOVERED', 'MONITORING', 'BRACKET_LOCKED', 'LIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GlobalContestStatus" AS ENUM ('OPEN', 'LOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('OPEN', 'DRAFTING', 'LOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DraftType" AS ENUM ('SNAKE', 'LINEAR', 'AUCTION');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SyncFeedType" AS ENUM ('TOURNAMENT_LIST', 'TOURNAMENT_SUMMARY', 'TOURNAMENT_SCHEDULE', 'GAME_SUMMARY', 'DAILY_CHANGE_LOG');

-- CreateTable
CREATE TABLE "tournaments" (
    "tournament_id" TEXT NOT NULL,
    "season_year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "sync_state" "TournamentSyncState" NOT NULL DEFAULT 'DISCOVERED',
    "bracket_locked_at" TIMESTAMPTZ(6),
    "next_check_at" TIMESTAMPTZ(6),
    "event_status_raw" JSONB,
    "payload_raw" JSONB,
    "max_points" INTEGER,
    "high_score_draft" INTEGER,
    "high_score_global" INTEGER,
    "stats_updated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("tournament_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "market" TEXT,
    "base_team_raw" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "tournament_teams" (
    "tournament_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "seed" SMALLINT,
    "region" TEXT,
    "quadrant" SMALLINT,
    "payload_raw" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("tournament_id","team_id")
);

-- CreateTable
CREATE TABLE "games" (
    "game_id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "round" TEXT,
    "round_seq" SMALLINT,
    "scheduled_at" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL,
    "is_play_in" BOOLEAN NOT NULL DEFAULT false,
    "home_team_id" TEXT,
    "away_team_id" TEXT,
    "winner_team_id" TEXT,
    "home_points" INTEGER,
    "away_points" INTEGER,
    "finalized_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "payload_raw" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "team_tournament_stats" (
    "tournament_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "team_score" INTEGER,
    "last_recalc_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "team_tournament_stats_pkey" PRIMARY KEY ("tournament_id","team_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMPTZ(6),
    "image" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL
);

-- CreateTable
CREATE TABLE "global_contests" (
    "global_contest_id" UUID NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Global',
    "status" "GlobalContestStatus" NOT NULL DEFAULT 'OPEN',
    "lock_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "global_contests_pkey" PRIMARY KEY ("global_contest_id")
);

-- CreateTable
CREATE TABLE "global_entries" (
    "global_entry_id" UUID NOT NULL,
    "global_contest_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_entries_pkey" PRIMARY KEY ("global_entry_id")
);

-- CreateTable
CREATE TABLE "global_picks" (
    "global_entry_id" UUID NOT NULL,
    "team_id" TEXT NOT NULL,
    "pick_no" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_picks_pkey" PRIMARY KEY ("global_entry_id","pick_no")
);

-- CreateTable
CREATE TABLE "global_scores" (
    "global_entry_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "breakdown" JSONB,
    "last_recalc_at" TIMESTAMPTZ(6),

    CONSTRAINT "global_scores_pkey" PRIMARY KEY ("global_entry_id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "draft_id" UUID NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'OPEN',
    "draft_type" "DraftType" NOT NULL DEFAULT 'SNAKE',
    "roster_size" INTEGER NOT NULL DEFAULT 8,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "invite_code" TEXT,
    "pick_timer_sec" INTEGER,
    "lock_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("draft_id")
);

-- CreateTable
CREATE TABLE "draft_participants" (
    "draft_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "pick_order" SMALLINT NOT NULL,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draft_participants_pkey" PRIMARY KEY ("draft_id","user_id")
);

-- CreateTable
CREATE TABLE "draft_picks" (
    "draft_pick_id" UUID NOT NULL,
    "draft_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "overall_pick_no" INTEGER NOT NULL,
    "roster_slot" SMALLINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draft_picks_pkey" PRIMARY KEY ("draft_pick_id")
);

-- CreateTable
CREATE TABLE "draft_scores" (
    "draft_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "breakdown" JSONB,
    "last_recalc_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "draft_scores_pkey" PRIMARY KEY ("draft_id","user_id")
);

-- CreateTable
CREATE TABLE "draft_invites" (
    "draft_invite_id" UUID NOT NULL,
    "draft_id" UUID NOT NULL,
    "email" TEXT,
    "invited_user_id" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "draft_invites_pkey" PRIMARY KEY ("draft_invite_id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "sync_log_id" UUID NOT NULL,
    "feed_type" "SyncFeedType" NOT NULL,
    "tournament_id" TEXT,
    "entity_id" TEXT,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "http_status" INTEGER NOT NULL,
    "error" TEXT,
    "payload" JSONB,
    "payload_hash" TEXT,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("sync_log_id")
);

-- CreateIndex
CREATE INDEX "ix_tournaments_season_year" ON "tournaments"("season_year");

-- CreateIndex
CREATE INDEX "ix_tournaments_state_nextcheck" ON "tournaments"("sync_state", "next_check_at");

-- CreateIndex
CREATE INDEX "ix_tournaments_start_date" ON "tournaments"("start_date");

-- CreateIndex
CREATE INDEX "ix_tournaments_high_score_draft" ON "tournaments"("high_score_draft");

-- CreateIndex
CREATE INDEX "ix_tournaments_high_score_global" ON "tournaments"("high_score_global");

-- CreateIndex
CREATE INDEX "ix_teams_alias" ON "teams"("alias");

-- CreateIndex
CREATE INDEX "ix_teams_name" ON "teams"("name");

-- CreateIndex
CREATE INDEX "ix_tournament_teams_seed" ON "tournament_teams"("tournament_id", "seed");

-- CreateIndex
CREATE INDEX "ix_tournament_teams_quadrant" ON "tournament_teams"("tournament_id", "quadrant");

-- CreateIndex
CREATE INDEX "ix_tournament_teams_team" ON "tournament_teams"("team_id");

-- CreateIndex
CREATE INDEX "ix_games_tournament_status" ON "games"("tournament_id", "status");

-- CreateIndex
CREATE INDEX "ix_games_tournament_finalized" ON "games"("tournament_id", "finalized_at");

-- CreateIndex
CREATE INDEX "ix_games_winner_team" ON "games"("winner_team_id");

-- CreateIndex
CREATE INDEX "ix_games_tournament_roundseq" ON "games"("tournament_id", "round_seq");

-- CreateIndex
CREATE INDEX "ix_games_tournament_scheduled" ON "games"("tournament_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "ix_games_tournament_playin" ON "games"("tournament_id", "is_play_in");

-- CreateIndex
CREATE INDEX "ix_team_tournament_stats_wins" ON "team_tournament_stats"("tournament_id", "wins");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "ix_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "ix_accounts_user" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_accounts_provider_provideraccount" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "ix_sessions_user" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ux_verification_tokens_identifier_token" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "ix_global_contests_status_lockat" ON "global_contests"("status", "lock_at");

-- CreateIndex
CREATE UNIQUE INDEX "ux_global_contests_tournament" ON "global_contests"("tournament_id");

-- CreateIndex
CREATE INDEX "ix_global_entries_user" ON "global_entries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_global_entries_contest_user" ON "global_entries"("global_contest_id", "user_id");

-- CreateIndex
CREATE INDEX "ix_global_picks_team" ON "global_picks"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_global_picks_entry_team" ON "global_picks"("global_entry_id", "team_id");

-- CreateIndex
CREATE INDEX "ix_global_scores_score" ON "global_scores"("score");

-- CreateIndex
CREATE UNIQUE INDEX "ux_drafts_invite_code" ON "drafts"("invite_code");

-- CreateIndex
CREATE INDEX "ix_drafts_tournament_status" ON "drafts"("tournament_id", "status");

-- CreateIndex
CREATE INDEX "ix_draft_participants_order" ON "draft_participants"("draft_id", "pick_order");

-- CreateIndex
CREATE INDEX "ix_draft_picks_draft_user" ON "draft_picks"("draft_id", "user_id");

-- CreateIndex
CREATE INDEX "ix_draft_picks_team" ON "draft_picks"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_draft_picks_draft_team" ON "draft_picks"("draft_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_draft_picks_draft_overallpick" ON "draft_picks"("draft_id", "overall_pick_no");

-- CreateIndex
CREATE UNIQUE INDEX "ux_draft_picks_user_rosterslot" ON "draft_picks"("draft_id", "user_id", "roster_slot");

-- CreateIndex
CREATE INDEX "ix_draft_scores_leaderboard" ON "draft_scores"("draft_id", "score");

-- CreateIndex
CREATE UNIQUE INDEX "ux_draft_invites_token" ON "draft_invites"("token");

-- CreateIndex
CREATE INDEX "ix_draft_invites_status" ON "draft_invites"("draft_id", "status");

-- CreateIndex
CREATE INDEX "ix_draft_invites_email" ON "draft_invites"("email");

-- CreateIndex
CREATE INDEX "ix_sync_logs_feed_fetched" ON "sync_logs"("feed_type", "fetched_at");

-- CreateIndex
CREATE INDEX "ix_sync_logs_tournament_feed_fetched" ON "sync_logs"("tournament_id", "feed_type", "fetched_at");

-- CreateIndex
CREATE INDEX "ix_sync_logs_entity_feed_fetched" ON "sync_logs"("entity_id", "feed_type", "fetched_at");

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_tournament_stats" ADD CONSTRAINT "team_tournament_stats_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_tournament_stats" ADD CONSTRAINT "team_tournament_stats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_contests" ADD CONSTRAINT "global_contests_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_entries" ADD CONSTRAINT "global_entries_global_contest_id_fkey" FOREIGN KEY ("global_contest_id") REFERENCES "global_contests"("global_contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_entries" ADD CONSTRAINT "global_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_picks" ADD CONSTRAINT "global_picks_global_entry_id_fkey" FOREIGN KEY ("global_entry_id") REFERENCES "global_entries"("global_entry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_picks" ADD CONSTRAINT "global_picks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_scores" ADD CONSTRAINT "global_scores_global_entry_id_fkey" FOREIGN KEY ("global_entry_id") REFERENCES "global_entries"("global_entry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_participants" ADD CONSTRAINT "draft_participants_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_participants" ADD CONSTRAINT "draft_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_scores" ADD CONSTRAINT "draft_scores_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_scores" ADD CONSTRAINT "draft_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_invites" ADD CONSTRAINT "draft_invites_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_invites" ADD CONSTRAINT "draft_invites_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("tournament_id") ON DELETE SET NULL ON UPDATE CASCADE;
