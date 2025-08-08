import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const draft = await db.draft.findUnique({ where: { id: id } });

    if (!draft || draft.authorId !== session.user.id) {
        return new NextResponse("Draft not found or permission denied", { status: 404 });
    }

    // --- Core Publishing Logic ---
    const postData = {
        title: draft.title,
        slug: draft.slug, // Ensure slug is unique before this step!
        content: draft.content,
        excerpt: draft.excerpt,
        featuredImage: draft.featuredImage,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        organizationId: draft.organizationId,
        authorId: draft.authorId,
        categoryId: draft.categoryId,
        publishedAt: new Date(),
    };
    
    let publishedPost;
    if (draft.postId) {
        // This is an update to an existing live post
        publishedPost = await db.post.update({
            where: { id: draft.postId },
            data: postData,
        });
        await db.draft.delete({ where: { id: id } });
    } else {
        // This is a brand new post going live for the first time
        publishedPost = await db.post.create({ data: postData });
        // Delete the draft
        await db.draft.delete({ where: { id: id } });
    }

    // --- Invalidate all relevant Redis caches ---
    await redis.del(`v1:post:${publishedPost.organizationId}:${publishedPost.slug}`);
    const keys = await redis.keys(`v1:posts:${publishedPost.organizationId}:*`);
    if (keys.length > 0) await redis.del(keys);

    return NextResponse.json(publishedPost);
}