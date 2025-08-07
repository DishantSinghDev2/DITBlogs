import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Suspense } from "react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { UserComments } from "@/components/dashboard/user-comments";
import { UserCommentsSkeleton } from "@/components/dashboard/user-comments-skeleton";
import { getUserCommentsActivity } from "@/lib/api/posts"; // FIX: Use the new function

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1;
  // FIX: Call the correct function
  const data = await getUserCommentsActivity(session.user.id, page);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Comments"
        text="A log of all your comments and replies."
      />
      <Suspense fallback={<UserCommentsSkeleton />}>
        {/* FIX: Pass the correct props down */}
        <UserComments
          comments={data.comments}
          totalPages={data.pagination.pages}
          currentPage={page}
        />
      </Suspense>
    </DashboardShell>
  );
}