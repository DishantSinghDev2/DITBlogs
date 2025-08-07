import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UsersTable } from "@/components/admin/users-table"; // We'll update this component next
import { getUserRoleInOrg } from "@/lib/api/user";
import { getAllUsersInOrg, getPendingRequests } from "@/lib/api/admin"; // Import new function
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string; search?: string; role?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  const orgId = user?.organizationId;
  if (!orgId) redirect("/onboarding");

  const userRole = await getUserRoleInOrg(session.user.id, orgId);
  if (userRole !== "ORG_ADMIN") redirect("/dashboard");

  const page = Number(searchParams.page) || 1;
  const per_page = Number(searchParams.per_page) || 10;
  const search = searchParams.search || "";
  const role = searchParams.role || "";

  // FIX: Fetch both members and pending requests in parallel
  const [membersData, pendingRequests] = await Promise.all([
    getAllUsersInOrg(orgId, page, per_page, search, role),
    getPendingRequests(orgId),
  ]);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Member Management"
        text="Manage your organization's members and handle join requests."
      />
      {/* Pass all data to the table component */}
      <UsersTable
        users={membersData.users}
        pagination={membersData.pagination}
        pendingRequests={pendingRequests}
      />
    </DashboardShell>
  );
}