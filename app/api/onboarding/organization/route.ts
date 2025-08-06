import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

const CACHE_KEY = "organizations:list";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Guard clause to prevent creating multiple orgs
    const existingOrg = await db.organization.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existingOrg) {
      return new NextResponse("User has already created an organization.", { status: 409 });
    }

    const body = await req.json();
    const { orgName, website } = body;

    if (!orgName || !website) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // FIX: Use an interactive transaction to handle dependent operations
    const newOrganization = await db.$transaction(async (tx) => {
      // Step 1: Create the organization and get its result.
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          website,
          ownerId: session.user.id,
        },
      });

      // Step 2: Use the new organization's ID to update the user.
      // The user who creates the org is automatically the ORG_ADMIN and a member.
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          onboardingCompleted: true,
          // Now you can safely reference the ID from the previous step.
          organizationId: organization.id,
          role: UserRole.ORG_ADMIN, // Assign the admin role
        },
      });

      // Step 3: Return the created organization from the transaction block.
      return organization;
    });

    // After the transaction is successful, invalidate the cache
    try {
      await redis.del(CACHE_KEY);
    } catch (error) {
      console.error("REDIS ERROR on DEL:", error);
    }

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error: any) {
    console.error("[ONBOARDING_ORGANIZATION_POST]", error);
    if (error.code === 'P2002') {
        return new NextResponse("An organization for this user already exists.", { status: 409 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}