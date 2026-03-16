-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('BUG', 'FEATURE', 'OTHER');

-- CreateTable
CREATE TABLE "feedback" (
    "feedback_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateIndex
CREATE INDEX "ix_feedback_user_created" ON "feedback"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
