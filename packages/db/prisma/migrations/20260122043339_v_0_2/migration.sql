-- CreateTable
CREATE TABLE "SchedulerLease" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lockedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchedulerLease_pkey" PRIMARY KEY ("id")
);
