import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { AffiliateLinksTable } from "@/components/admin/affiliate-links-table"
import { Button } from "@/components/ui/button"
import { checkUserRole } from "@/lib/api/user"
import { getAllAffiliateLinks } from "@/lib/api/affiliate"
import { Plus } from "lucide-react"

export default async function AffiliateLinksPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has appropriate role
  const isAdminOrEditor =
    (await checkUserRole(session.user.id, "admin")) || (await checkUserRole(session.user.id, "editor"))

  if (!isAdminOrEditor) {
    redirect("/dashboard")
  }

  const affiliateLinks = await getAllAffiliateLinks()

  return (
    <DashboardShell>
      <DashboardHeader heading="Affiliate Links" text="Manage your affiliate links">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </DashboardHeader>
      <AffiliateLinksTable affiliateLinks={affiliateLinks} />
    </DashboardShell>
  )
}
