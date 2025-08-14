// /lib/api/v1/custom-ratelimit.ts (Create this new file)

import { redis } from "@/lib/redis"; // Assuming your redis client is ioredis

interface RateLimiterOptions {
  redis: typeof redis;
  identifier: string;
  limit: number;
  window: number; // Window duration in seconds
}

/**
 * A custom sliding window rate limiter using Redis Sorted Sets.
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

  // Use a MULTI/EXEC transaction for atomicity
  const multi = redisClient.multi();

  // 1. Remove all requests from the sorted set that are outside the current window
  multi.zremrangebyscore(key, 0, windowStart);

  // 2. Add the current request. The member is unique, the score is the timestamp.
  multi.zadd(key, now, `${now}-${Math.random()}`);
  
  // 3. Count the number of requests in the set (which are all within the window)
  multi.zcard(key);

  // 4. Set an expiration on the key itself to auto-clean users who stop making requests
  multi.expire(key, windowSeconds + 5);

  const results = await multi.exec();

  // The result of the ZCARD command is the 3rd item in the results array
  // Format from ioredis.multi.exec() is [[error, value], [error, value], ...]
  const currentRequests = results?.[2]?.[1] as number | null;

  if (currentRequests === null) {
      // This indicates a Redis transaction error
      throw new Error("Could not verify rate limit.");
  }

  return { success: currentRequests <= limit };
}