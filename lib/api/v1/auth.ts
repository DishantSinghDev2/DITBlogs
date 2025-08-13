// /home/dit/blogs/DITBlogs/lib/api/v1/auth.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/config/plans"; // Assume PLAN_LIMITS includes an overageFactor
import { isAfter, subHours } from "date-fns";
import { Organization } from "@prisma/client";

// Initialize a generic rate limiter to prevent brute-force attacks on the auth layer.
// More specific, plan-based rate limits could be applied after authentication if needed.
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@v1/ratelimit",
});

/**
 * This function is the security gateway for the V1 API. It handles:
 * 1. Rate Limiting: Prevents abuse from a single client.
 * 2. API Key Authentication: Validates the key, using a cache for high performance.
 * 3. Usage-Based Authorization: Enforces hard and soft limits based on the org's plan.
 *
 * NOTE: This authenticates an ORGANIZATION via a static API key. It does not handle
 * end-user sessions (e.g., for a logged-in user posting a comment). A separate
 * authentication mechanism (like JWTs) would be needed for that.
 */
export async function authenticateAndCheckUsage(req: NextRequest) {
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
  const ip = req.ip ?? '127.0.0.1'; // Use IP as a fallback identifier for rate limiting

  // --- 1. Rate Limiting (Fail-Fast) ---
  // Apply rate limiting early to protect against key-scanning or DDoS attacks.
  try {
    const identifier = apiKey || ip;
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return { error: "Too Many Requests.", status: 429, org: null, warning: null, userId: null };
    }
  } catch (e) {
      console.error("[AUTH_RATELIMIT_ERROR]", e);
      // If ratelimiter fails, we deny the request to be safe.
      return { error: "Internal Server Error.", status: 500, org: null, warning: null, userId: null };
  }
  
  if (!apiKey) {
    return { error: "Unauthorized: API key is missing.", status: 401, org: null, warning: null, userId: null };
  }

  // --- 2. API Key Authentication (with Cache) ---
  const cacheKey = `v1:auth:${apiKey}`;
  let org: Organization | null = null;

  try {
    const cachedOrg = await redis.get(cacheKey);
    if (cachedOrg) {
      org = JSON.parse(cachedOrg as string);
    }
  } catch (e) {
    console.error(`[AUTH_CACHE_GET_ERROR]`, e);
    // If cache is down, we proceed to DB but log the error.
  }

  if (!org) {
    // CACHE MISS: Fetch from the database
    try {
        const dbOrg = await db.organization.findUnique({
            where: { apiKey },
        });

        if (dbOrg) {
            org = dbOrg;
            // Populate the cache for subsequent requests
            await redis.set(cacheKey, JSON.stringify(org), { EX: 900 }); // Cache for 15 minutes
        }
    } catch(e) {
        console.error("[AUTH_DB_ERROR]", e);
        return { error: "Internal Server Error.", status: 500, org: null, warning: null, userId: null };
    }
  }

  if (!org) {
    return { error: "Unauthorized: Invalid API key.", status: 401, org: null, warning: null, userId: null };
  }

  // --- 3. Usage Limit Enforcement (Hard & Soft Limits) ---
  const planLimits = PLAN_LIMITS[org.plan];
  const usage = org.monthlyPostViews;
  const softLimit = planLimits.viewsPerMonth;
  const hardLimit = softLimit * (planLimits.overageFactor || 1); // Default to no overage if not defined

  // A. HARD LIMIT: Block the request if usage exceeds the allowed overage.
  if (usage >= hardLimit) {
    const errorMessage = `Usage limit exceeded. Your plan's hard limit is ${hardLimit.toLocaleString()} views per month.`;
    return { error: errorMessage, status: 403, org, warning: null, userId: null }; // 403 Forbidden is more semantic here
  }

  // B. SOFT LIMIT: Allow the request but include a warning header.
  let warning: string | null = null;
  if (usage >= softLimit) {
    warning = `You have used ${Math.round((usage / softLimit) * 100)}% of your monthly view limit for the ${org.plan} plan.`;

    // Throttle sending formal notifications (e.g., emails) to once every 24 hours.
    const shouldSendWarning = !org.limitWarningSentAt || isAfter(new Date(), subHours(org.limitWarningSentAt, -24));
    if (shouldSendWarning) {
        // In a real app, you would trigger a transactional email or other notification here.
        // console.log(`Sending usage limit warning email to organization ${org.id}`);
        await db.organization.update({
            where: { id: org.id },
            data: { limitWarningSentAt: new Date() },
        });
    }
  }
  
  // --- 4. Success ---
  // NOTE: 'userId' is null here because this is org-level auth.
  // The calling function would be responsible for handling user-specific identity.
  return { error: null, status: 200, org, warning, userId: null };
}