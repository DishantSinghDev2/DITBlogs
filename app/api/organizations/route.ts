import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { Plan, UserRole } from "@prisma/client";
import { invalidateOrgCache } from "@/lib/cache";
import { NextResponse } from "next/server";

const CACHE_KEY = "organizations:list";

export async function GET() {
  // 1. Try to fetch from Redis first
  try {
    const cachedOrganizations = await redis.get(CACHE_KEY);
    if (cachedOrganizations) {
      console.log("CACHE HIT: Organizations list");
      return NextResponse.json(JSON.parse(cachedOrganizations));
    }
  } catch (error) {
    console.error("REDIS ERROR on GET:", error);
    // If Redis fails, we'll just fall back to the database without crashing
  }

  // 2. If not in cache (or Redis fails), fetch from the database
  try {
    console.log("CACHE MISS: Fetching organizations from DB");
    const organizations = await db.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // 3. Store the result in Redis for next time with an expiration
    try {
      // Cache for 1 hour (3600 seconds)
      await redis.set(CACHE_KEY, JSON.stringify(organizations), { EX: 3600 });
    } catch (error) {
      console.error("REDIS ERROR on SET:", error);
    }
    
    return NextResponse.json(organizations);
  } catch (error) {
    console.error("[ORGANIZATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const CUSTOM_PLAN_EMAIL = "dishantsinghdev@icloud.com"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { orgName, website } = await req.json()
    if (!orgName?.trim() || !website?.trim()) return new NextResponse("Missing fields", { status: 400 })

    const plan: Plan = session.user.email === CUSTOM_PLAN_EMAIL ? Plan.CUSTOM : Plan.FREE

    const org = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: orgName.trim(), website: website.trim(), ownerId: session.user.id, plan },
      })
      await tx.user.update({
        where: { id: session.user.id },
        data: { organizationId: organization.id, role: UserRole.ORG_ADMIN, membershipStatus: "APPROVED" },
      })
      await tx.userOrganization.upsert({
        where: { userId_organizationId: { userId: session.user.id, organizationId: organization.id } },
        update: { role: UserRole.ORG_ADMIN, membershipStatus: "APPROVED" },
        create: { userId: session.user.id, organizationId: organization.id, role: UserRole.ORG_ADMIN, membershipStatus: "APPROVED" },
      })
      return organization
    })

    await invalidateOrgCache(org.id)
    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    console.error("[ORGANIZATIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}