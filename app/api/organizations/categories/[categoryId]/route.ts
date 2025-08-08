import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";

// PUT handler to update a category
export async function PUT(req: Request, { params }: { params: { categoryId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
    if (!user?.organizationId) return new NextResponse("Forbidden", { status: 403 });
    
    const canManage = await canUserPerformAction(session.user.id, "org:manage_categories", user.organizationId);
    if (!canManage) return new NextResponse("Forbidden", { status: 403 });

    const { name, description } = await req.json();
    const updatedCategory = await db.category.update({
        where: { id: params.categoryId, organizationId: user.organizationId },
        data: { name, description },
    });
    
    await redis.del(`v1:categories:${user.organizationId}`); // Invalidate list cache
    await redis.del(`v1:category:${user.organizationId}:${updatedCategory.slug}`); // Invalidate single item cache

    return NextResponse.json(updatedCategory);
}

// DELETE handler
export async function DELETE(req: Request, { params }: { params: { categoryId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
    if (!user?.organizationId) return new NextResponse("Forbidden", { status: 403 });

    const canManage = await canUserPerformAction(session.user.id, "org:manage_categories", user.organizationId);
    if (!canManage) return new NextResponse("Forbidden", { status: 403 });
    
    // Safety check: prevent deleting a category that has posts
    const postCount = await db.post.count({ where: { categoryId: params.categoryId } });
    if (postCount > 0) {
        return new NextResponse("Cannot delete a category with active posts.", { status: 409 });
    }

    const deletedCategory = await db.category.delete({ where: { id: params.categoryId, organizationId: user.organizationId } });
    
    await redis.del(`v1:categories:${user.organizationId}`);
    await redis.del(`v1:category:${user.organizationId}:${deletedCategory.slug}`);
    
    return new NextResponse(null, { status: 204 });
}