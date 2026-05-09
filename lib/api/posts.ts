import { db } from "@/lib/db"
import { cache } from "react"
import { UserRole } from "@prisma/client"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

export const getAllPosts = cache(
  async ({
    page = 1,
    limit = 10,
    category,
    tag,
    search,
    featured = false,
  }: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const skip = (page - 1) * limit;

    // Build a stable cache key from query params
    const cacheKey = featured && page === 1 && !category && !tag && !search
      ? CACHE_KEYS.featured
      : CACHE_KEYS.posts(
          `p${page}:l${limit}:c${category ?? ""}:t${tag ?? ""}:s${search ?? ""}:f${featured}`
        );

    const cached = await cacheGet<{ posts: unknown[]; pagination: unknown }>(cacheKey);
    if (cached) return cached;

    const query: any = {};

    if (featured) query.featured = true;

    if (category) {
      query.category = { slug: category };
    }

    if (tag) {
      query.tags = { some: { slug: tag } };
    }

    if (search) {
      query.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await db.$transaction([
      db.post.findMany({
        where: query,
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          category: true,
          tags: true,
          _count: {
            select: { comments: true, views: true },
          },
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.post.count({ where: query }),
    ]);

    const result = {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    const ttl = featured ? CACHE_TTL.featured : CACHE_TTL.posts;
    await cacheSet(cacheKey, result, ttl);

    return result;
  }
);

export const getPostBySlug = cache(async (slug: string, userId?: string) => {
  const cacheKey = CACHE_KEYS.post(slug);

  const cached = await cacheGet<any>(cacheKey);
  if (cached?.id) {
    const isBookmarked = userId
      ? cached.bookmarks?.some((b: { userId: string }) => b.userId === userId)
      : false;
    return { ...cached, isBookmarked };
  }

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true, bio: true },
      },
      bookmarks: {
        select: { userId: true },
      },
      category: true,
      tags: true,
      _count: {
        select: { comments: true, views: true },
      },
    },
  });

  if (!post) return null;

  const isBookmarked = userId
    ? post.bookmarks.some((b) => b.userId === userId)
    : false;

  // Cache without user-specific bookmark flag
  const { isBookmarked: _ignored, ...postToCache } = { ...post, isBookmarked };
  await cacheSet(cacheKey, postToCache, CACHE_TTL.post);

  return { ...post, isBookmarked };
});


/**
 * Fetches content scoped to the user's role:
 * - ORG_ADMIN / EDITOR → all content in their organization
 * - WRITER             → only their own content
 */
export const getUserContent = cache(async (
  userId: string,
  page = 1,
  limit = 10,
  status: "draft" | "published" = "published",
  query: string = "",
  userRole?: UserRole | null,
  organizationId?: string | null,
) => {
  const skip = (page - 1) * limit;

  const isOrgWideRole =
    organizationId &&
    (userRole === UserRole.ORG_ADMIN || userRole === UserRole.EDITOR);

  const scopeFilter = isOrgWideRole
    ? { organizationId }
    : { authorId: userId };

  const searchFilter = query
    ? { title: { contains: query, mode: "insensitive" as const } }
    : {};

  const where = { ...scopeFilter, ...searchFilter };

  if (status === "published") {
    const [posts, total] = await db.$transaction([
      db.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: true,
          tags: true,
          _count: { select: { comments: true, views: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return {
      content: posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  const [drafts, total] = await db.$transaction([
    db.draft.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: true,
        tags: true,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    db.draft.count({ where }),
  ]);

  return {
    content: drafts,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
});


export const getRelatedPosts = cache(async (postId: string, categoryId?: string | null) => {
  const query: any = { id: { not: postId } };
  if (categoryId) query.categoryId = categoryId;

  return db.post.findMany({
    where: query,
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
});

export const incrementPostView = async (postId: string) => {
  await db.postView.create({
    data: { post: { connect: { id: postId } } },
  });
  return true;
};

export const getFeaturedPosts = cache(async (limit = 6) => {
  const { posts } = await getAllPosts({ featured: true, limit });
  return posts;
});

export const getUserCommentsActivity = cache(async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await db.$transaction([
    db.comment.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: { select: { title: true, slug: true } },
        parent: { select: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.comment.count({ where: { userId } }),
  ]);

  return {
    comments,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
});
