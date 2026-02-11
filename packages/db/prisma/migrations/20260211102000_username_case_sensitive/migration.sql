DROP INDEX IF EXISTS "ix_users_username";
DROP INDEX IF EXISTS "ux_users_username_normalized";

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "username_normalized";

CREATE UNIQUE INDEX "ux_users_username"
  ON "users" ("username");
