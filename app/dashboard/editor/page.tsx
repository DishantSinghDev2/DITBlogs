import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { BlogEditor } from "@/components/editor/blog-editor"
import { checkUserPermission } from "@/lib/api/user"

export default async function EditorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to create/edit posts
  const canCreatePost = await checkUserPermission(session.user.id, "create:post")

  if (!canCreatePost) {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Create New Post" text="Write and publish a new blog post." />
      <BlogEditor />
    </DashboardShell>
  )
}
