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

  // Prefer the organizationId from the session (already in JWT), fall back to DB.
  let activeOrgId = session.user.organizationId

  if (!activeOrgId) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, onboardingCompleted: true },
    })
    activeOrgId = user?.organizationId ?? undefined

    // Only send to onboarding if they genuinely haven't completed it.
    if (!activeOrgId && !user?.onboardingCompleted) {
      redirect("/onboarding")
    }
  }

  // FIX: Call the function with the correct arguments
  const userRole = (await getUserRoleInOrg(
    session.user.id,
    activeOrgId
  )) as UserRole | null;

  console.log(userRole)

  return <DashboardShell userRole={userRole}>{children}</DashboardShell>;
}