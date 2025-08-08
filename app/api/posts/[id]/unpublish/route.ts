import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";

// A dedicated endpoint to move a Post back to a Draft
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const canEdit = await canUserPerformAction(session.user.id, "post:edit", id);
    if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

    // Use a transaction to ensure atomicity
    const unpublishedDraft = await db.$transaction(async (tx) => {
        const post = await tx.post.findUnique({ where: { id: id } });
        if (!post) throw new Error("Post not found");

        // 1. Create a new Draft from the Post's content
        const newDraft = await tx.draft.create({
            data: {
                title: post.title,
                slug: post.slug, // The slug is preserved
                content: post.content,
                excerpt: post.excerpt,
                featuredImage: post.featuredImage,
                metaTitle: post.metaTitle,
                metaDescription: post.metaDescription,
                authorId: post.authorId,
                organizationId: post.organizationId,
                categoryId: post.categoryId,
                postId: post.id, // Link back to the original post ID
            }
        });

        // 2. Delete the live Post
        await tx.post.delete({ where: { id: id } });
        
        return newDraft;
    });

    // 3. Invalidate caches
    await redis.del(`v1:post:${unpublishedDraft.organizationId}:${unpublishedDraft.slug}`);
    const keys = await redis.keys(`v1:posts:${unpublishedDraft.organizationId}:*`);
    if(keys.length > 0) await redis.del(keys);

    return NextResponse.json(unpublishedDraft);
}