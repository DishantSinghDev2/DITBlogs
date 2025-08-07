-- AlterEnum
ALTER TYPE "Plan" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "limitWarningSentAt" TIMESTAMP(3);
