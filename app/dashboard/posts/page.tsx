import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { PenTool } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { PostsTable } from "@/components/dashboard/posts-table";
import { Button } from "@/components/ui/button";
import { getUserContent } from "@/lib/api/posts"; // Use the correct, refactored function

export default async function PostsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    per_page?: string;
    status?: 'published' | 'draft'; // <-- New param to control the tab
    query?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const sP = await searchParams

  const page = Number(sP.page) || 1;
  const per_page = Number(sP.per_page) || 10;
  const status = sP.status || 'published'; // Default to the 'published' tab
  const query = sP.query || "";
  const { content, pagination } = await getUserContent(session.user.id, page, per_page, status, query);


  return (
    <DashboardShell>
      <DashboardHeader heading="Content" text="Manage your drafts and published posts.">
      </DashboardHeader>

      {/* Pass the content and status to the client component */}
      <PostsTable content={content} pagination={pagination} currentStatus={status} query={query} />
    </DashboardShell>
  );
}