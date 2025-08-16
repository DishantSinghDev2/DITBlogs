// /home/dit/blogs/DITBlogs/app/api/posts/[id]/unpublish/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";
import { triggerWebhooks } from "@/lib/webhook-trigger"; // Assuming you have this
import { Post, Draft } from "@prisma/client"; // <-- IMPORT PRISMA TYPES

// A dedicated endpoint to move a Post back to a Draft
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const canEdit = await canUserPerformAction(session.user.id, "post:edit", id);
    if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

    // --- THIS IS THE FIX ---
    // Use a descriptive variable name for the transaction result
    const transactionResult = await db.$transaction(async (tx): Promise<{ originalPost: Post, newDraft: Draft }> => {
        const post = await tx.post.findUnique({ where: { id: id } });
        if (!post) {
            // Throwing an error inside a transaction automatically rolls it back.
            throw new Error("Post not found, transaction rolled back.");
        }

        // 1. Create a new Draft from the Post's content
        const newDraft = await tx.draft.create({
            data: {
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt,
                featuredImage: post.featuredImage,
                metaTitle: post.metaTitle,
                metaDescription: post.metaDescription,
                authorId: post.authorId,
                organizationId: post.organizationId,
                categoryId: post.categoryId,
                postId: post.id,
            }
        });

        // 2. Delete the live Post
        await tx.post.delete({ where: { id: id } });

        // Return both the original post (for the webhook) and the new draft (for the API response)
        return { originalPost: post, newDraft };
    });

    // Destructure with confidence because TypeScript now knows the shape of transactionResult
    const { originalPost, newDraft } = transactionResult;

    // 3. Invalidate caches
    // --- Invalidate all relevant Redis caches ---
    await redis.del(`v1:post:${originalPost.organizationId}:${originalPost.slug}`);
    const keys = await redis.keys(`v1:posts:${originalPost.organizationId}:*`);
    if (keys.length > 0) await redis.del(keys);

    // Also delete legacy/simple cache by slug
    await redis.del(`post:${originalPost.slug}`);


    // 4. Trigger webhooks using the data from the now-deleted post
    await triggerWebhooks(originalPost.organizationId, 'post.unpublished', { post: originalPost });

    // 5. Return the newly created draft object to the client
    return NextResponse.json(newDraft);
}