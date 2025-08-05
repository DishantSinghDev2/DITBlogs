import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentPosts } from "@/components/dashboard/recent-posts"
import { DraftPosts } from "@/components/dashboard/draft-posts"
import { getUserStats, getRecentPosts, getDraftPosts } from "@/lib/api/dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const stats = await getUserStats(session.user.id)
  const recentPosts = await getRecentPosts(session.user.id)
  const draftPosts = await getDraftPosts(session.user.id)

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Welcome back! Here's an overview of your activity." />
      <div className="grid gap-6">
        <DashboardStats stats={stats} />
        <div className="grid gap-6 md:grid-cols-2">
          <RecentPosts posts={recentPosts} />
          <DraftPosts posts={draftPosts} />
        </div>
      </div>
    </DashboardShell>
  )
}
