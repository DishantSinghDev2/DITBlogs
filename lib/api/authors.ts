// filename: src/lib/authors.ts

"use server"

import { db } from "@/lib/db"
import { cache } from "react"

export type Author = {
  id: string
  name: string
  email: string
  image: string | null
  bio: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  postsCount: number
  followersCount: number
  followingCount: number
  
}

export type AuthorWithPosts = Author & {
  posts: {
    id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readingTime: number
  viewCount: number
  commentCount: number
  category: {
    id: string
    name: string
    slug: string
  }
  }[]
}

export const getAuthors = cache(async (page = 1, limit = 12) => {
  const skip = (page - 1) * limit

  try {
    const authors = await db.user.findMany({
      where: {
        OR: [{ role: "ADMIN" }, { role: "EDITOR" }, { role: "WRITER" }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      skip,
      take: limit,
    })

    const totalAuthors = await db.user.count({
      where: {
        OR: [{ role: "ADMIN" }, { role: "EDITOR" }, { role: "WRITER" }],
      },
    })

    return {
      authors: authors.map((author) => ({
        ...author,
        postsCount: author._count.posts,
        followersCount: author._count.followers,
        followingCount: author._count.following
      })),
      totalPages: Math.ceil(totalAuthors / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching authors:", error)
    throw new Error("Failed to fetch authors")
  }
})

export const getAuthorById = cache(async (id: string) => {
  try {
    const author = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!author) {
      throw new Error("Author not found")
    }

    return {
      ...author,
      postsCount: author._count.posts,
      followersCount: author._count.followers,
      followingCount: author._count.following
    }
  } catch (error) {
    console.error(`Error fetching author with ID ${id}:`, error)
    throw new Error("Failed to fetch author")
  }
})

export const getAuthorPosts = cache(async (authorId: string, page = 1, limit = 6) => {
  const skip = (page - 1) * limit

  try {
    const posts = await db.post.findMany({
      where: {
        authorId,
        published: true,
        publishedAt: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readingTime: true,
        categoryId: true, // Add categoryId to the selection
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            views: true,
            comments: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
    })

    const totalPosts = await db.post.count({
      where: {
        authorId,
        published: true,
        publishedAt: {
          lte: new Date(),
        },
      },
    })

    return {
      posts: posts.map((post) => ({
        ...post,
        viewCount: post._count.views,
        commentCount: post._count.comments,
      })),
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error(`Error fetching posts for author ${authorId}:`, error)
    throw new Error("Failed to fetch author posts")
  }
})

export const followAuthor = async (authorId: string, userId: string) => {
  try {
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: authorId,
        },
      },
    });

    if (existingFollow) {
      await db.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: authorId,
          },
        },
      });
      return { success: true, following: false };
    } else {
      await db.follow.create({
        data: {
          followerId: userId,
          followingId: authorId,
        },
      });
      return { success: true, following: true };
    }
  } catch (error) {
    console.error("Error toggling author follow:", error);
    throw new Error("Failed to follow/unfollow author");
  }
};

export const isFollowingAuthor = async (authorId: string, userId: string) => {
  if (!userId) return false

  try {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: authorId,
        },
      },
    })

    return !!follow
  } catch (error) {
    console.error("Error checking follow status:", error)
    return false
  }
}
