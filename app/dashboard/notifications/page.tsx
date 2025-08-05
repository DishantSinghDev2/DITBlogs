import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { NotificationsList } from "@/components/dashboard/notifications-list"
import { getUserNotifications } from "@/lib/api/notifications"

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const page = Number(searchParams.page) || 1
  const per_page = Number(searchParams.per_page) || 20

  const { notifications, pagination, unreadCount } = await getUserNotifications(session.user.id, page, per_page)

  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="View your recent notifications" />
      <NotificationsList notifications={notifications} pagination={pagination} unreadCount={unreadCount} />
    </DashboardShell>
  )
}
