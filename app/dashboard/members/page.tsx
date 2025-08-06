import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db"; // Import Prisma client

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UsersTable } from "@/components/admin/users-table";
import { getUserRoleInOrg } from "@/lib/api/user";
import { getAllUsersInOrg } from "@/lib/api/admin"; // Renamed for clarity

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string; search?: string; role?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 1. Get user's organization context
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  const orgId = user?.organizationId;
  if (!orgId) {
    // Should not happen if user is properly onboarded
    redirect("/onboarding");
  }

  // 2. Check if user is an ORG_ADMIN for their organization
  const userRole = await getUserRoleInOrg(session.user.id, orgId);
  if (userRole !== "ORG_ADMIN") {
    redirect("/dashboard");
  }

  const page = Number(searchParams.page) || 1;
  const per_page = Number(searchParams.per_page) || 10;
  const search = searchParams.search || "";
  const role = searchParams.role || "";

  // 3. Fetch users specifically for the current organization
  const { users, pagination } = await getAllUsersInOrg(orgId, page, per_page, search, role);

  return (
    <div className="space-y-4">
      <DashboardHeader
        heading="Member Management"
        text="Manage your organization's members and their roles." />
      <UsersTable users={users} pagination={pagination} />
    </div>
  );
}