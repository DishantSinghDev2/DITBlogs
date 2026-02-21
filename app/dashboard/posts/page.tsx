import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { PenTool } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { PostsTable } from "@/components/dashboard/posts-table";
import { Button } from "@/components/ui/button";
import { getUserContent } from "@/lib/api/posts";
import { db } from "@/lib/db";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    per_page?: string;
    status?: "published" | "draft";
    query?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  // Fetch the user's role and organizationId so getUserContent can
  // scope the query correctly (org-wide for admins/editors, own-only for writers).
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, organizationId: true },
  });

  const sP = await searchParams;

  const page = Number(sP.page) || 1;
  const per_page = Number(sP.per_page) || 10;
  const status = sP.status || "published";
  const query = sP.query || "";

  const { content, pagination } = await getUserContent(
    session.user.id,
    page,
    per_page,
    status,
    query,
    user?.role,           // role-aware scoping
    user?.organizationId, // org-wide for admin/editor
  );

  return (
    <DashboardShell>
      <DashboardHeader heading="Content" text="Manage your drafts and published posts.">
        <Button asChild>
          <Link href="/dashboard/editor">
            <PenTool className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </DashboardHeader>

      <PostsTable
        content={content}
        pagination={pagination}
        currentStatus={status}
        query={query}
      />
    </DashboardShell>
  );
}