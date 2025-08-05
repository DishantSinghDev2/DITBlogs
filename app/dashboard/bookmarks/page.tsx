import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { BookmarksList } from "@/components/dashboard/bookmarks-list"
import { getUserBookmarks } from "@/lib/api/bookmarks"

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const page = Number(searchParams.page) || 1
  const per_page = Number(searchParams.per_page) || 12

  const { bookmarks, pagination } = await getUserBookmarks(session.user.id, page, per_page)

  return (
    <DashboardShell>
      <DashboardHeader heading="Bookmarks" text="View and manage your saved posts" />
      <BookmarksList bookmarks={bookmarks} pagination={pagination} />
    </DashboardShell>
  )
}
