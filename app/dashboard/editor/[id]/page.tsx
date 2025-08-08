import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { BlogEditor } from "@/components/editor/blog-editor";
import { canUserPerformAction } from "@/lib/api/user";

// This page now handles editing EITHER a Post or a Draft
export default async function EditContentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const contentId = params.id;
  let contentData: any = null;
  let contentType: 'post' | 'draft' | null = null;

  // 1. Determine if the ID belongs to a Post or a Draft
  const post = await db.post.findUnique({ where: { id: contentId } });

  if (post) {
    contentType = 'post';
    contentData = post;
  } else {
    const draft = await db.draft.findUnique({ where: { id: contentId } });
    if (draft) {
      contentType = 'draft';
      contentData = draft;
    }
  }

  // If content is not found in either table, it's a 404
  if (!contentType || !contentData) {
    return notFound();
  }

  // 2. Perform the correct permission check based on the content type
  let canEdit = false;
  if (contentType === 'post') {
    // A 'post:edit' implies creating a new draft from the post, so we check that perm.
    canEdit = await canUserPerformAction(session.user.id, "post:edit", contentId);
  } else { // contentType === 'draft'
    canEdit = await canUserPerformAction(session.user.id, "draft:edit", contentId);
  }

  if (!canEdit) {
    redirect("/dashboard?error=permission_denied");
  }

  // 3. Handle the "Edit a Live Post" workflow
  // If the user is trying to edit a live post, we must create a draft copy for them.
  if (contentType === 'post') {
    const newDraft = await db.draft.create({
      data: {
        title: contentData.title,
        slug: contentData.slug,
        content: contentData.content,
        excerpt: contentData.excerpt,
        featuredImage: contentData.featuredImage,
        metaTitle: contentData.metaTitle,
        metaDescription: contentData.metaDescription,
        authorId: contentData.authorId,
        organizationId: contentData.organizationId,
        categoryId: contentData.categoryId,
        postId: contentData.id, // Link this draft back to the original post
      },
    });
    // Redirect the user to the new draft's editor page.
    // The user will now safely edit a copy, not the live post.
    return redirect(`/dashboard/editor/${newDraft.id}`);
  }

  // 4. If we are here, it means the user is editing a DRAFT. Fetch organization details.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      organization: { select: { plan: true } },
    },
  });

  if (!user?.organization) {
    redirect("/dashboard?error=no_organization");
  }

  // 5. Render the editor with the DRAFT data
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Draft"
        text="Make changes to your draft before publishing."
      />
      <BlogEditor
        // Pass the full DRAFT object
        post={contentData}
        // Pass the orgId from the draft itself
        organizationId={contentData.organizationId}
        organizationPlan={user.organization.plan}
      />
    </DashboardShell>
  );
}