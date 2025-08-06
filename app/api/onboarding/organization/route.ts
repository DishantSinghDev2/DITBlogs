import { db } from "@/lib/db";
import { redis } from "@/lib/redis"; // Import the Redis client
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

const CACHE_KEY = "organizations:list";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

     // --- FIX: ADD THIS GUARD CLAUSE ---
    // Check if the user already owns an organization before trying to create one.
    const existingOrg = await db.organization.findUnique({
      where: {
        ownerId: session.user.id,
      },
    });

    if (existingOrg) {
      // Return a 409 Conflict error, as this action cannot be performed again.
      return new NextResponse("User has already created an organization.", { status: 409 });
    }
    // --- END OF FIX ---

    const body = await req.json();
    const { orgName, website } = body;

    if (!orgName || !website) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Use a transaction to ensure both operations succeed or fail together
    const [newOrganization] = await db.$transaction([
      db.organization.create({
        data: {
          name: orgName,
          website,
          ownerId: session.user.id,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { onboardingCompleted: true },
      }),
    ]);
    
    // After successful creation, invalidate the cache
    try {
      console.log("CACHE INVALIDATION: Deleting organizations list");
      await redis.del(CACHE_KEY);
    } catch (error) {
      console.error("REDIS ERROR on DEL:", error);
      // Don't fail the request if Redis is down, just log the error
    }

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("[ONBOARDING_ORGANIZATION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}