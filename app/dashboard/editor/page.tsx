import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db"; // Import your Prisma client

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { BlogEditor } from "@/components/editor/blog-editor";
import { canUserPerformAction } from "@/lib/api/user"; // Ensure this path is correct

export default async function EditorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, organization: { select: {plan: true} } },
  });
  const orgId = user?.organizationId;
  if (!orgId) redirect("/dashboard");

  const canCreatePost = await canUserPerformAction(session.user.id, "post:create", orgId);
  if (!canCreatePost) redirect("/dashboard");

  // FIX: Fetch the user's existing drafts
  const userDrafts = await db.draft.findMany({
      where: { authorId: session.user.id, organizationId: orgId },
      orderBy: { updatedAt: 'desc' }
  });

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Post"
        text="Write and publish a new blog post."
      />
      {/* FIX: Pass both organizationId and the fetched drafts */}
      <BlogEditor organizationId={orgId} drafts={userDrafts} organizationPlan={user.organization?.plan} />
    </DashboardShell>
  );
}
