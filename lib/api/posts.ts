import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { cache } from "react"

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

    // Build the query
    const query: any = {
      published: true,
    };

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

    // Get posts
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

    // Get total count
    const total = await db.post.count({
      where: query,
    });

    const result = {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache featured posts
    if (featured && page === 1 && !category && !tag && !search) {
      await redis.set("featured_posts", JSON.stringify(result), {
        ex: 60 * 60, // 1 hour
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
        // If cache is found and userId is passed, compute isBookmarked here
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

  // Cache the post *without* isBookmarked (since it's user-specific)
  const { isBookmarked: _, ...postToCache } = postWithComputed;
  await redis.set(`post:${slug}`, JSON.stringify(postToCache), {
    ex: 60 * 60, // 1 hour
  });

  return postWithComputed;
});


export const getUserPosts = cache(async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const posts = await db.post.findMany({
    where: {
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          comments: true,
          views: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  const total = await db.post.count({
    where: {
      authorId: userId,
    },
  })

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
})

export const getRelatedPosts = cache(async (postId: string, categoryId?: string | null) => {
  const query: any = {
    id: { not: postId },
    published: true,
  }

  if (categoryId) {
    query.categoryId = categoryId
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
  })

  return posts
})

export const incrementPostView = async (postId: string) => {
  // Create a view record
  await db.postView.create({
    data: {
      post: {
        connect: { id: postId },
      },
    },
  })

  return true
}

export const getFeaturedPosts = cache(async (limit = 6) => {
  const { posts } = await getAllPosts({ featured: true, limit })
  return posts
})

// function to get comments by userId
export const getCommentsByUserId = cache(async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const comments = await db.comment.findMany({
    where: {
      userId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  const total = await db.comment.count({
    where: {
      userId,
    },
  })

  return {
    comments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
})