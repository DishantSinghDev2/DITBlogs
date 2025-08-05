import { db } from "@/lib/db"
import { cache } from "react"

export const getUserStats = cache(async (userId: string) => {
  const [postCount, viewCount, commentCount, draftCount] = await Promise.all([
    db.post.count({
      where: {
        authorId: userId,
        published: true,
      },
    }),
    db.postView.count({
      where: {
        post: {
          authorId: userId,
        },
      },
    }),
    db.comment.count({
      where: {
        post: {
          authorId: userId,
        },
      },
    }),
    db.post.count({
      where: {
        authorId: userId,
        published: false,
      },
    }),
  ])

  return {
    postCount,
    viewCount,
    commentCount,
    draftCount,
  }
})

export const getRecentPosts = cache(async (userId: string) => {
  return db.post.findMany({
    where: {
      authorId: userId,
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      category: true,
      _count: {
        select: {
          comments: true,
          views: true,
        },
      },
    },
  })
})

export const getDraftPosts = cache(async (userId: string) => {
  return db.post.findMany({
    where: {
      authorId: userId,
      published: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    include: {
      category: true,
    },
  })
})
