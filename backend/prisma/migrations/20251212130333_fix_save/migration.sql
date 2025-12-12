-- AlterTable
ALTER TABLE "investor_profiles" ADD COLUMN     "last_completed_step" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "step_completion_status" JSONB;
