import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { BlogEditor } from "@/components/editor/blog-editor";
import { canUserPerformAction } from "@/lib/api/user"; // Your permission checker

// The page is now an async Server Component
export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 1. Security Check: Use your robust permission checker.
  // This function should internally verify that the post belongs to the user's organization
  // and that the user's role allows editing.
  const canEdit = await canUserPerformAction(session.user.id, "post:edit", params.id);

  if (!canEdit) {
    // If they don't have permission, don't even let them know the post exists.
    // Redirecting is a safe and user-friendly option.
    redirect("/dashboard");
  }
  
  // 2. Fetch the full post data and the user's organizationId
  // We can fetch user data separately or trust the permission check has done its job.
  // For passing the prop, we need the organizationId explicitly.
  const [post, user] = await Promise.all([
    db.post.findUnique({
      where: { id: params.id },
    }),
    db.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true }
    })
  ]);

  // 3. Handle the case where the post might not be found
  if (!post) {
    // This will render the not-found.tsx file, which is the idiomatic way
    notFound();
  }
  
  // A final check in case the user has no organization set
  if (!user?.organizationId) {
    redirect('/dashboard?error=no_organization');
  }

  // 4. Render the page with all necessary data passed as props
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Post"
        text="Make changes to your existing blog post."
      />
      <BlogEditor 
        // Pass the full post object to populate the editor fields
        post={post} 
        // CRUCIAL: Pass the organizationId for the save/update logic
        organizationId={user.organizationId}
      />
    </DashboardShell>
  );
}