import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";
import { customRateLimiter } from "./custom-ratelimit";

type WriteAuthResult =
  | { error: string; status: number; org: null }
  | { error: null; status: 200; org: { id: string; ownerId: string; plan: string; name: string } };

/**
 * Security gateway for V1 write endpoints (POST / PUT / DELETE).
 * Stricter rate limit than read auth (20 writes per 60 s vs 10 reads per 10 s).
 * Does NOT increment monthlyPostViews — that counter is for reads only.
 */
export async function authenticateForWrite(req: NextRequest): Promise<WriteAuthResult> {
  const apiKeyString = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
  const ip = req.ip ?? "127.0.0.1";

  // Rate limit: 20 write requests per 60 seconds per key (or IP when unauthenticated)
  try {
    const identifier = `write:${apiKeyString || ip}`;
    const { success } = await customRateLimiter({ redis, identifier, limit: 20, window: 60 });
    if (!success) return { error: "Too Many Requests.", status: 429, org: null };
  } catch {
    return { error: "Internal Server Error.", status: 500, org: null };
  }

  if (!apiKeyString) {
    return { error: "Unauthorized: API key is missing.", status: 401, org: null };
  }

  // Re-use the same cache slot as the read auth to avoid redundant DB round-trips
  const cacheKey = `v1:auth:key:${apiKeyString}`;
  let apiKeyData: { id: string; organizationId: string; organization: { id: string; ownerId: string; plan: string; name: string } } | null = null;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) apiKeyData = JSON.parse(cached as string);
  } catch {
    // Cache miss is fine — fall through to DB
  }

  if (!apiKeyData) {
    try {
      const dbApiKey = await db.apiKey.findUnique({
        where: { key: apiKeyString },
        include: { organization: { select: { id: true, ownerId: true, plan: true, name: true } } },
      });
      if (dbApiKey) {
        apiKeyData = dbApiKey as typeof apiKeyData;
        await redis.set(cacheKey, JSON.stringify(dbApiKey), { EX: 900 });
      }
    } catch {
      return { error: "Internal Server Error.", status: 500, org: null };
    }
  }

  if (!apiKeyData) {
    return { error: "Unauthorized: Invalid API key.", status: 401, org: null };
  }

  // Track usage non-blocking
  db.apiKey
    .update({ where: { id: apiKeyData.id }, data: { requests: { increment: 1 }, lastUsedAt: new Date() } })
    .catch(() => {});

  return { error: null, status: 200, org: apiKeyData.organization };
}
