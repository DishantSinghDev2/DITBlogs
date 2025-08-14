// /lib/api/v1/custom-ratelimit.ts (Corrected for node-redis v4+)

import { redis } from "@/lib/redis";

interface RateLimiterOptions {
  redis: typeof redis;
  identifier: string;
  limit: number;
  window: number; // Window duration in seconds
}

/**
 * A custom sliding window rate limiter using Redis Sorted Sets with node-redis v4 syntax.
 * @returns { success: boolean } - True if the request is within the limit, false otherwise.
 */
export async function customRateLimiter({
  redis: redisClient,
  identifier,
  limit,
  window: windowSeconds,
}: RateLimiterOptions): Promise<{ success: boolean }> {
  const key = `rate-limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // For node-redis, you chain commands to a multi() object.
    const multi = redisClient.multi();

    // 1. Remove all requests from the sorted set that are outside the current window
    // Command is now zRemRangeByScore (camelCase of ZREMRANGEBYSCORE)
    multi.zRemRangeByScore(key, 0, windowStart);

    // 2. Add the current request. The score is the timestamp, the member is unique.
    // Command is zAdd
    multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

    // 3. Count the number of requests in the set (which are all within the window)
    // Command is zCard
    multi.zCard(key);
    
    // 4. Set an expiration on the key itself to auto-clean users who stop making requests
    multi.expire(key, windowSeconds + 5);

    // .exec() returns a simple array of results in node-redis v4
    const results = await multi.exec();

    // The result of the ZCARD command is the 3rd item in the results array
    const currentRequests = results[2] as number | null;

    if (currentRequests === null) {
      // This indicates a Redis transaction error
      throw new Error("Could not verify rate limit due to Redis error.");
    }

    return { success: currentRequests <= limit };
    
  } catch (error) {
    console.error("[CUSTOM_RATELIMIT_ERROR]", error);
    // If Redis fails for any reason, we throw to let the caller handle it.
    throw new Error("Could not verify rate limit.");
  }
}