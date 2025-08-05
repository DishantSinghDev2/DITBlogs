import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserRole } from "@/lib/api/user"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const userRole = await getUserRole(session.user.id)

  return <DashboardShell userRole={userRole}>{children}</DashboardShell>
}
