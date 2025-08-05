import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { SeoSettings } from "@/components/admin/seo-settings"
import { checkUserRole } from "@/lib/api/user"
import { getSEOSettings } from "@/lib/api/settings"

export default async function AdminSeoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = await checkUserRole(session.user.id, "admin")

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const siteConfig = await getSEOSettings()

  return (
    <DashboardShell>
      <DashboardHeader heading="SEO Settings" text="Optimize your site for search engines." />
      <SeoSettings siteConfig={siteConfig} />
    </DashboardShell>
  )
}
