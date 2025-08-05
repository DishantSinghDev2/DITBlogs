import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { checkUserRole } from "@/lib/api/user"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { AdminSettings } from "@/components/admin/admin-settings"
import { getSettings } from "@/lib/api/settings"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const isAdmin = await checkUserRole(session.user.id, "admin")

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const settings = await getSettings()

  return (
    <DashboardShell>
      <DashboardHeader heading="Site Settings" text="Manage your site settings and configuration." />
      <AdminSettings initialSettings={settings} />
    </DashboardShell>
  )
}
