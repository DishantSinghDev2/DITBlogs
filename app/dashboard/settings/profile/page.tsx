// dashboard/settings/profile
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserSettings } from "@/components/dashboard/user-settings"
import { getUserById } from "@/lib/api/user"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account settings and preferences." />
      <UserSettings user={user} />
    </DashboardShell>
  )
}
