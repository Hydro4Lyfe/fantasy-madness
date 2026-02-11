ALTER TABLE "users"
  ADD COLUMN "username" TEXT,
  ADD COLUMN "username_normalized" TEXT,
  ADD COLUMN "username_changed_at" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "ux_users_username_normalized"
  ON "users"("username_normalized");

CREATE INDEX "ix_users_username"
  ON "users"("username");
