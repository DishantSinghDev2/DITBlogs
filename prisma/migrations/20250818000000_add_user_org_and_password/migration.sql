-- Add password field to User for credentials-based auth
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Create UserOrganization join table for multi-org membership
CREATE TABLE IF NOT EXISTS "UserOrganization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WRITER',
    "membershipStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "UserOrganization_userId_organizationId_key" ON "UserOrganization"("userId", "organizationId");
CREATE INDEX IF NOT EXISTS "UserOrganization_userId_idx" ON "UserOrganization"("userId");
CREATE INDEX IF NOT EXISTS "UserOrganization_organizationId_idx" ON "UserOrganization"("organizationId");

-- Foreign keys
DO $$ BEGIN
    ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
