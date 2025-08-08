import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/config/plans";
import slugify from "slugify";
import { redis } from "@/lib/redis";
import { canUserPerformAction } from "@/lib/api/user";

// GET handler to fetch all categories for the admin's organization
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
    if (!user?.organizationId) return new NextResponse("User not in an organization", { status: 403 });

    const categories = await db.category.findMany({ where: { organizationId: user.organizationId } });
    return NextResponse.json(categories);
}

// POST handler to create a new category
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const org = await db.organization.findFirst({
            where: { members: { some: { id: session.user.id } } },
            include: { _count: { select: { categories: true } } }
        });
        if (!org) return new NextResponse("Organization not found", { status: 404 });

        const canManage = await canUserPerformAction(session.user.id, "org:manage_categories", org.id);
        if (!canManage) return new NextResponse("Forbidden", { status: 403 });

        const planLimits = PLAN_LIMITS[org.plan];
        if (org._count.categories >= planLimits.categories) {
            return new NextResponse(`You have reached the limit of ${planLimits.categories} categories for the ${org.plan} plan.`, { status: 403 });
        }

        const { name, description } = await req.json();
        const slug = slugify(name, { lower: true, strict: true });

        const newCategory = await db.category.create({
            data: { name, description, slug, organizationId: org.id }
        });
        
        await redis.del(`v1:categories:${org.id}`); // Invalidate cache

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}