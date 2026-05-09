-- Add sessionVersion to User for instant role propagation.
-- Incremented whenever an admin changes a member's role; clients poll a
-- lightweight endpoint and call update() when their token version lags.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 1;
