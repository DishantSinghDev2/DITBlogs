import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { cache } from "react"
import { UserRole } from "@prisma/client"

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

    const query: any = {};

    if (featured) {
      query.featured = true;
    }

    if (category) {
      query.category = {
        slug: category,
      };
    }

    if (tag) {
      query.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (search) {
      query.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // Check cache for featured posts
    if (featured && page === 1 && !category && !tag && !search) {
      const cachedPosts = await redis.get("featured_posts");
      if (cachedPosts && typeof cachedPosts === "string") {
        return JSON.parse(cachedPosts);
      }
    }

    const posts = await db.post.findMany({
      where: query,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: true,
            views: true,
          },
        },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    });

    const total = await db.post.count({ where: query });

    const result = {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    if (featured && page === 1 && !category && !tag && !search) {
      await redis.set("featured_posts", JSON.stringify(result), {
        EX: 60 * 60,
      });
    }

    return result;
  }
);

export const getPostBySlug = cache(async (slug: string, userId?: string) => {
  try {
    const cached = await redis.get(`post:${slug}`);
    if (cached && typeof cached === "string") {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.id) {
        const isBookmarked = userId
          ? parsed.bookmarks?.some((b: { userId: string }) => b.userId === userId)
          : false;

        return {
          ...parsed,
          isBookmarked,
        };
      }
    }
  } catch (err) {
    console.error("Redis cache parse error:", err);
  }

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      bookmarks: {
        select: {
          userId: true,
        },
      },
      category: true,
      tags: true,
      _count: {
        select: {
          comments: true,
          views: true,
        },
      },
    },
  });

  if (!post) return null;

  const isBookmarked = userId
    ? post.bookmarks.some((b) => b.userId === userId)
    : false;

  const postWithComputed = {
    ...post,
    isBookmarked,
  };

  const { isBookmarked: _, ...postToCache } = postWithComputed;
  await redis.set(`post:${slug}`, JSON.stringify(postToCache), {
    EX: 60 * 60,
  });

  return postWithComputed;
});


/**
 * Fetches content (posts or drafts) scoped to the user's role:
 *
 * - ORG_ADMIN / EDITOR  → all content belonging to their organization
 * - WRITER              → only their own content
 *
 * Pass `organizationId` for org-scoped roles.  When it is absent (e.g. the
 * user has no org yet) the function falls back to author-only filtering so
 * nothing breaks.
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

  // ORG_ADMIN and EDITOR see everything in their org.
  // WRITER (or unknown role) sees only their own content.
  const isOrgWideRole =
    organizationId &&
    (userRole === UserRole.ORG_ADMIN || userRole === UserRole.EDITOR);

  const scopeFilter = isOrgWideRole
    ? { organizationId }          // entire org
    : { authorId: userId };       // own content only

  const searchFilter = query
    ? { title: { contains: query, mode: "insensitive" as const } }
    : {};

  const where = { ...scopeFilter, ...searchFilter };

  if (status === "published") {
    const [posts, total] = await db.$transaction([
      db.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          tags: true,
          _count: {
            select: {
              comments: true,
              views: true,
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return {
      content: posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } else {
    // drafts
    const [drafts, total] = await db.$transaction([
      db.draft.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
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
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
});


export const getRelatedPosts = cache(async (postId: string, categoryId?: string | null) => {
  const query: any = {
    id: { not: postId },
  };

  if (categoryId) {
    query.categoryId = categoryId;
  }

  const posts = await db.post.findMany({
    where: query,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
  });

  return posts;
});

export const incrementPostView = async (postId: string) => {
  await db.postView.create({
    data: {
      post: {
        connect: { id: postId },
      },
    },
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
        post: {
          select: {
            title: true,
            slug: true,
          },
        },
        parent: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.comment.count({ where: { userId } }),
  ]);

  return {
    comments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
});