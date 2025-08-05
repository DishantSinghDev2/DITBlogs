import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UsersTable } from "@/components/admin/users-table"
import { checkUserRole } from "@/lib/api/user"
import { getAllUsers } from "@/lib/api/admin"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string; search?: string; role?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = await checkUserRole(session.user.id, "admin")

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const page = Number(searchParams.page) || 1
  const per_page = Number(searchParams.per_page) || 10
  const search = searchParams.search || ""
  const role = searchParams.role || ""

  const { users, pagination } = await getAllUsers(page, per_page, search, role)

  return (
    <DashboardShell>
      <DashboardHeader heading="User Management" text="Manage users and their roles" />
      <UsersTable users={users} pagination={pagination} />
    </DashboardShell>
  )
}
