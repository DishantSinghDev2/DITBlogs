import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/config/plans";
import { isAfter, subHours } from "date-fns";

// Initialize a rate limiter: 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// This is the main function to protect V1 API routes
export async function authenticateAndCheckUsage(req: NextRequest) {
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!apiKey) {
    return { error: "Unauthorized: API key is missing.", status: 401, org: null, warning: null };
  }

  // --- 1. Rate Limiting ---
  const { success } = await ratelimit.limit(apiKey);
  if (!success) {
    return { error: "Too Many Requests.", status: 429, org: null, warning: null };
  }

  // --- 2. API Key Authentication ---
  const org = await db.organization.findUnique({
    where: { apiKey },
  });
  if (!org) {
    return { error: "Unauthorized: Invalid API key.", status: 401, org: null, warning: null };
  }

  // --- 3. Usage Limit Check & Warning System ---
  const planLimits = PLAN_LIMITS[org.plan];
  let warning: string | null = null;
  if (org.monthlyPostViews >= planLimits.viewsPerMonth) {
    warning = `You have exceeded the ${planLimits.viewsPerMonth.toLocaleString()} monthly views limit for the ${org.plan} plan.`;

    // Only send a formal warning (e.g., email) if one hasn't been sent in the last 24 hours
    if (!org.limitWarningSentAt || isAfter(new Date(), subHours(org.limitWarningSentAt, -24))) {
        // Here you would trigger an email to the org owner
        // mailer.sendUsageLimitWarningEmail(org.owner.email, warning);
        await db.organization.update({
            where: { id: org.id },
            data: { limitWarningSentAt: new Date() },
        });
    }
  }
  
  return { error: null, status: 200, org, warning };
}