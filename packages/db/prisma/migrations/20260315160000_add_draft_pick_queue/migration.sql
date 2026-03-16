-- CreateTable
CREATE TABLE "draft_pick_queues" (
    "draft_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "slot_ids" UUID[],
    "auto_pick_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "draft_pick_queues_pkey" PRIMARY KEY ("draft_id","user_id")
);

-- AddForeignKey
ALTER TABLE "draft_pick_queues" ADD CONSTRAINT "draft_pick_queues_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_pick_queues" ADD CONSTRAINT "draft_pick_queues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
