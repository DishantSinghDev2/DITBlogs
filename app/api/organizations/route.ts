import { db } from "@/lib/db";
import { redis } from "@/lib/redis"; // Import the Redis client
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