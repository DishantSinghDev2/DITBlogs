import { redis } from "@/lib/redis"

export const CACHE_KEYS = {
  post: (slug: string) => `post:${slug}`,
  posts: (params: string) => `posts:${params}`,
  featured: "featured_posts",
  orgList: "organizations:list",
  orgStats: (orgId: string) => `org:stats:${orgId}`,
  analytics: (orgId: string) => `org:analytics:${orgId}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
}

export const CACHE_TTL = {
  post: 60 * 60 * 24,      // 24h for individual posts
  posts: 60 * 60 * 2,      // 2h for post listings
  featured: 60 * 60 * 6,   // 6h for featured posts
  orgList: 60 * 60,         // 1h for org list
  stats: 60 * 15,           // 15min for stats
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key)
    if (!val) return null
    return JSON.parse(val as string) as T
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttl })
  } catch (err) {
    console.error(`[CACHE_SET] Failed for key ${key}:`, err)
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  try {
    await redis.del(keys)
  } catch (err) {
    console.error("[CACHE_DEL] Failed:", err)
  }
}

/** Delete all keys matching a pattern (e.g. "posts:*") */
export async function cacheFlushPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(keys)
  } catch (err) {
    console.error(`[CACHE_FLUSH] Failed for pattern ${pattern}:`, err)
  }
}

/** Call when a post is created, updated, or deleted */
export async function invalidatePostCache(slug: string, orgId?: string): Promise<void> {
  await Promise.all([
    cacheDel(CACHE_KEYS.post(slug)),
    cacheDel(CACHE_KEYS.featured),
    cacheFlushPattern("posts:*"),
    // v2 API keys used by /api/v1/posts
    orgId ? cacheDel(`v2:post:${orgId}:${slug}`) : Promise.resolve(),
    orgId ? cacheFlushPattern(`v2:posts:${orgId}:*`) : Promise.resolve(),
  ])
}

/** Call when any post list should be refreshed (bulk publish, org settings change, etc.) */
export async function invalidateAllPostsCache(orgId?: string): Promise<void> {
  await Promise.all([
    cacheDel(CACHE_KEYS.featured),
    cacheFlushPattern("posts:*"),
    orgId ? cacheFlushPattern(`v2:posts:${orgId}:*`) : Promise.resolve(),
  ])
}

/** Call when org membership/settings change */
export async function invalidateOrgCache(orgId: string): Promise<void> {
  await Promise.all([
    cacheDel(CACHE_KEYS.orgList),
    cacheDel(CACHE_KEYS.orgStats(orgId)),
    cacheDel(CACHE_KEYS.analytics(orgId)),
  ])
}
