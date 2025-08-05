import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { checkUserRole } from "@/lib/api/user"
import { getAnalyticsData } from "@/lib/api/analytics"

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = await checkUserRole(session.user.id, "admin")

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const analyticsData = await getAnalyticsData()

  return (
    <DashboardShell>
      <DashboardHeader heading="Analytics Dashboard" text="View detailed analytics about your site." />
      <AnalyticsDashboard data={analyticsData} />
    </DashboardShell>
  )
}
