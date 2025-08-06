import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db"; // Import your Prisma client

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserRoleInOrg } from "@/lib/api/user";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { type UserRole } from "@prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // FIX: Fetch the user from the DB to get their organization context
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true, // The org they are a member of
      ownedOrganization: { select: { id: true } }, // The org they own
    },
  });

  // Determine the active organization ID. Prioritize ownership.
  const activeOrgId = user?.ownedOrganization?.id || user?.organizationId;

  // If user has no organization context, they can't use the dashboard.
  if (!activeOrgId) {
    // This could happen if a writer's request hasn't been approved yet.
    // Redirect them to a waiting page or back to onboarding.
    redirect("/onboarding");
  }

  // FIX: Call the function with the correct arguments
  const userRole = (await getUserRoleInOrg(
    session.user.id,
    activeOrgId
  )) as UserRole | null;

  console.log(userRole)

  return <DashboardShell userRole={userRole}>{children}</DashboardShell>;
}