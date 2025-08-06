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

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 1. Fetch the user's details to get their organization ID
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      organizationId: true,
    },
  });

  console.log(user)

  // 2. If the user doesn't belong to any organization, they can't create posts.
  if (!user?.organizationId) {
    // You might want to redirect them to a page that says "Join an organization first"
    // or simply back to the dashboard.
    console.log("Redirecting: User does not belong to an organization.");
    redirect("/dashboard");
  }

  // 3. Call the permission function with the correct arguments
  // The resourceId for creating a post is the ID of the organization it will belong to.
  const canCreatePost = await canUserPerformAction(
    session.user.id,
    "post:create",
    user.organizationId
  );

  if (!canCreatePost) {
    console.log("Redirecting: User lacks 'post:create' permission for this org.");
    redirect("/dashboard");
  }

  // 4. Pass the organizationId to the editor so it knows where to save the post
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Post"
        text="Write and publish a new blog post."
      />
      <BlogEditor organizationId={user.organizationId} />
    </DashboardShell>
  );
}