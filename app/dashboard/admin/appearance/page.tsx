import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { AppearanceSettings } from "@/components/admin/appearance-settings"
import { checkUserRole } from "@/lib/api/user"
import { getSettings } from "@/lib/api/settings"

export default async function AdminAppearancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = await checkUserRole(session.user.id, "admin")

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const siteConfig = await getSettings()

  return (
    <DashboardShell>
      <DashboardHeader heading="Appearance" text="Customize your site's look and feel." />
      <AppearanceSettings siteConfig={siteConfig} />
    </DashboardShell>
  )
}
