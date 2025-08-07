import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/config/plans";
import slugify from "slugify";

// GET handler to fetch all categories for the admin's organization
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
    if (!user?.organizationId) return new NextResponse("User not in an organization", { status: 403 });

    const categories = await db.category.findMany({ where: { organizationId: user.organizationId } });
    return NextResponse.json(categories);
}

// POST handler to create a new category, respecting plan limits
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const org = await db.organization.findFirst({
        where: { members: { some: { id: session.user.id } } },
        include: { _count: { select: { categories: true } } }
    });
    if (!org) return new NextResponse("Organization not found", { status: 404 });

    // --- Enforce Plan Limits ---
    const planLimits = PLAN_LIMITS[org.plan];
    if (org._count.categories >= planLimits.categories) {
        return new NextResponse(`You have reached the limit of ${planLimits.categories} categories for the ${org.plan} plan.`, { status: 403 });
    }

    const { name } = await req.json();
    const slug = slugify(name, { lower: true });

    const newCategory = await db.category.create({
        data: { name, slug, organizationId: org.id }
    });
    return NextResponse.json(newCategory, { status: 201 });
}