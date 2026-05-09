-- Cast UserOrganization.role from TEXT to UserRole enum
ALTER TABLE "UserOrganization"
  ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";

-- Cast UserOrganization.membershipStatus from TEXT to MembershipStatus enum
ALTER TABLE "UserOrganization"
  ALTER COLUMN "membershipStatus" TYPE "MembershipStatus" USING "membershipStatus"::"MembershipStatus";
