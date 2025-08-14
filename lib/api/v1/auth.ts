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
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
  const ip = req.ip ?? '127.0.0.1';

  // --- 1. Rate Limiting (Fail-Fast) with our Custom Limiter ---
  try {
    const identifier = apiKey || ip;
    
    // --- REPLACE THIS BLOCK ---
    // const { success } = await ratelimit.limit(identifier);
    
    // --- WITH THIS BLOCK ---
    const { success } = await customRateLimiter({
      redis: redis,
      identifier: identifier,
      limit: 10,       // Max 10 requests
      window: 10,      // Per 10 seconds
    });
    // --- END REPLACEMENT ---

    if (!success) {
      return { error: "Too Many Requests.", status: 429, org: null, warning: null, userId: null };
    }
  } catch (e) {
      console.error("[AUTH_RATELIMIT_ERROR]", e);
      // If redis fails, we deny the request to be safe.
      return { error: "Internal Server Error.", status: 500, org: null, warning: null, userId: null };
  }
  
  if (!apiKey) {
    return { error: "Unauthorized: API key is missing.", status: 401, org: null, warning: null, userId: null };
  }

  // --- 2. API Key Authentication (with Cache) ---
  // ... NO CHANGES NEEDED HERE ...
  const cacheKey = `v1:auth:${apiKey}`;
  let org: Organization | null = null;

  try {
    const cachedOrg = await redis.get(cacheKey);
    if (cachedOrg) {
      org = JSON.parse(cachedOrg as string);
    }
  } catch (e) {
    console.error(`[AUTH_CACHE_GET_ERROR]`, e);
  }

  if (!org) {
    try {
        const dbOrg = await db.organization.findUnique({
            where: { apiKey },
        });
        if (dbOrg) {
            org = dbOrg;
            await redis.set(cacheKey, JSON.stringify(org), { EX: 900 });
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
  // ... NO CHANGES NEEDED HERE ...
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