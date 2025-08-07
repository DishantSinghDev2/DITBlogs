import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";

export async function PUT(req: Request, { params }: { params: { postId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    
    const { postId } = params;
    const canEdit = await canUserPerformAction(session.user.id, "post:edit", postId);
    if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

    const body = await req.json();
    const { slug, ...updateData } = body; 

    // FIX: Add logic to handle slug conflicts gracefully for auto-save
    if (slug) {
        // Check if the new slug already exists on a DIFFERENT post
        const slugConflict = await db.post.findFirst({
            where: {
                slug: slug,
                id: { not: postId } // Exclude the current post from the check
            }
        });

        // If there is no conflict, we can safely update the slug
        if (!slugConflict) {
            updateData.slug = slug;
        }
        // If there IS a conflict, we simply DON'T update the slug.
        // The title and content will still be saved, which is the most important part.
        // The final "Publish" action will handle definitive slug resolution.
    }

    const updatedDraft = await db.post.update({
        where: { id: postId },
        data: { ...updateData, published: false },
    });
    return NextResponse.json(updatedDraft);
  } catch (error) {
    // The unique constraint error should no longer happen, but this is good practice
    if (error instanceof Error && (error as any).code === 'P2002') {
         return new NextResponse("A post with this slug already exists.", { status: 409 });
    }
    console.error("[DRAFT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}