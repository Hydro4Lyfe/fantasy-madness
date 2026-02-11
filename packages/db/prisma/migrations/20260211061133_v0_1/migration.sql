-- CreateIndex
CREATE INDEX "ix_sync_logs_feed_fetched" ON "sync_logs"("feed_type", "fetched_at");

-- CreateIndex
CREATE INDEX "ix_sync_logs_tournament_feed_fetched" ON "sync_logs"("tournament_id", "feed_type", "fetched_at");

-- CreateIndex
CREATE INDEX "ix_sync_logs_entity_feed_fetched" ON "sync_logs"("entity_id", "feed_type", "fetched_at");
