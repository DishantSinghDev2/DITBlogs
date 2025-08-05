import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { PostsTable } from "@/components/dashboard/posts-table"
import { Button } from "@/components/ui/button"
import { getUserPosts } from "@/lib/api/posts"
import { PenTool } from "lucide-react"
import Link from "next/link"

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const page = Number(searchParams.page) || 1
  const per_page = Number(searchParams.per_page) || 10

  const { posts, pagination } = await getUserPosts(session.user.id, page, per_page)

  return (
    <DashboardShell>
      <DashboardHeader heading="Posts" text="Manage your blog posts">
        <Button asChild>
          <Link href="/dashboard/editor">
            <PenTool className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </DashboardHeader>
      <PostsTable posts={posts} pagination={pagination} />
    </DashboardShell>
  )
}
