import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Suspense } from "react"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { UserComments } from "@/components/dashboard/user-comments"
import { UserCommentsSkeleton } from "@/components/dashboard/user-comments-skeleton"
import { getCommentsByUserId } from "@/lib/api/posts"

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
    const session = await getServerSession(authOptions)
    
    if (!session) {
        redirect("/auth/login")
    }
    
    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const comments = await getCommentsByUserId(session.user.id, page)

  return (
    <DashboardShell>
      <DashboardHeader heading="Comments" text="Manage your comments across all posts." />
      <Suspense fallback={<UserCommentsSkeleton />}>
        <UserComments userId={session.user.id} currentPage={page} comments={comments.comments} totalPages={comments.pagination.total} />
      </Suspense>
    </DashboardShell>
  )
}
