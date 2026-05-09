-- Drop defaults before casting (PostgreSQL can't auto-cast text defaults to enum)
ALTER TABLE "UserOrganization" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "UserOrganization" ALTER COLUMN "membershipStatus" DROP DEFAULT;

-- Cast from TEXT to proper enum types
ALTER TABLE "UserOrganization"
  ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "UserOrganization"
  ALTER COLUMN "membershipStatus" TYPE "MembershipStatus" USING "membershipStatus"::"MembershipStatus";

-- Re-apply defaults
ALTER TABLE "UserOrganization" ALTER COLUMN "role" SET DEFAULT 'WRITER'::"UserRole";
ALTER TABLE "UserOrganization" ALTER COLUMN "membershipStatus" SET DEFAULT 'PENDING'::"MembershipStatus";
