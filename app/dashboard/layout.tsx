import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserRoleInOrg } from "@/lib/api/user";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { type UserRole } from "@prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  // Prefer session (JWT), fall back to live DB read
  let activeOrgId: string | undefined = session.user.organizationId || undefined;
  if (!activeOrgId) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });
    activeOrgId = dbUser?.organizationId ?? undefined;
  }

  const userRole = activeOrgId
    ? ((await getUserRoleInOrg(session.user.id, activeOrgId)) as UserRole | null)
    : null;

  return (
    <DashboardShell userRole={userRole} hasOrg={!!activeOrgId}>
      {children}
    </DashboardShell>
  );
}
