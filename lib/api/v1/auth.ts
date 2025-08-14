// /home/dit/blogs/DITBlogs/lib/api/v1/auth.ts (Updated version)

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";
import { PLAN_LIMITS } from "@/config/plans";
import { isAfter, subHours } from "date-fns";
import { Organization } from "@prisma/client";
import { customRateLimiter } from "./custom-ratelimit"; // <-- IMPORT OUR NEW FUNCTION

// --- REMOVE THE UPSTASH RATELIMIT INITIALIZATION ---
// const ratelimit = new Ratelimit({ ... });

/**
 * This function is the security gateway for the V1 API. It handles:
 * 1. Rate Limiting: Prevents abuse from a single client using our custom Redis implementation.
 * ... (rest of the comment)
 */
export async function authenticateAndCheckUsage(req: NextRequest) {
  const apiKeyString = req.headers.get('Authorization')?.replace('Bearer ', '');
  const ip = req.ip ?? '127.0.0.1';

  // 1. Rate Limiting (no changes here)
  try {
    const identifier = apiKeyString || ip;
    const { success } = await customRateLimiter({
      redis: redis, identifier, limit: 10, window: 10,
    });
    if (!success) return { error: "Too Many Requests.", status: 429 };
  } catch (e) {
    console.error("[AUTH_RATELIMIT_ERROR]", e);
    return { error: "Internal Server Error.", status: 500 };
  }
  
  if (!apiKeyString) {
    return { error: "Unauthorized: API key is missing.", status: 401 };
  }


  // --- 2. API Key Authentication (Refactored) ---
  const cacheKey = `v1:auth:key:${apiKeyString}`;
  let apiKeyData;

  try {
    const cachedKey = await redis.get(cacheKey);
    if (cachedKey) {
      apiKeyData = JSON.parse(cachedKey as string);
    }
  } catch (e) {
    console.error(`[AUTH_CACHE_GET_ERROR]`, e);
  }

  if (!apiKeyData) {
    // CACHE MISS: Fetch from the database
    try {
      // Find the key and include its parent organization
      const dbApiKey = await db.apiKey.findUnique({
        where: { key: apiKeyString },
        include: { organization: true },
      });

      if (dbApiKey) {
        apiKeyData = dbApiKey;
        // Cache the entire API key object, including the nested organization
        await redis.set(cacheKey, JSON.stringify(dbApiKey), { EX: 900 });
      }
    } catch(e) {
      console.error("[AUTH_DB_ERROR]", e);
      return { error: "Internal Server Error.", status: 500 };
    }
  }

  if (!apiKeyData) {
    return { error: "Unauthorized: Invalid API key.", status: 401 };
  }

  // Asynchronously update usage stats without blocking the response
  Promise.all([
    db.apiKey.update({ where: { id: apiKeyData.id }, data: { requests: { increment: 1 }, lastUsedAt: new Date() } }),
    db.organization.update({ where: { id: apiKeyData.organizationId }, data: { monthlyPostViews: { increment: 1 } } })
  ]).catch(err => console.error("Failed to update usage stats:", err));

  // Destructure the organization from the fetched API key data
  const org = apiKeyData.organization;
  // --- 3. Usage Limit Enforcement (Hard & Soft Limits) ---
  const planLimits = PLAN_LIMITS[org.plan];
  const usage = org.monthlyPostViews;
  const softLimit = planLimits.viewsPerMonth;
  const hardLimit = softLimit * (planLimits.overageFactor || 1); 

  if (usage >= hardLimit) {
    const errorMessage = `Usage limit exceeded. Your plan's hard limit is ${hardLimit.toLocaleString()} views per month.`;
    return { error: errorMessage, status: 403, org, warning: null, userId: null };
  }

  let warning: string | null = null;
  if (usage >= softLimit) {
    warning = `You have used ${Math.round((usage / softLimit) * 100)}% of your monthly view limit for the ${org.plan} plan.`;
    const shouldSendWarning = !org.limitWarningSentAt || isAfter(new Date(), subHours(org.limitWarningSentAt, -24));
    if (shouldSendWarning) {
        await db.organization.update({
            where: { id: org.id },
            data: { limitWarningSentAt: new Date() },
        });
    }
  }
  
  // --- 4. Success ---
  return { error: null, status: 200, org, warning, userId: null };
}