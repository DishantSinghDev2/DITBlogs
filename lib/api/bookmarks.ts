import { db } from "@/lib/db"

export const getUserBookmarks = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const bookmarks = await db.bookmark.findMany({
    where: {
      userId,
    },
    include: {
      post: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  const total = await db.bookmark.count({
    where: {
      userId,
    },
  })

  return {
    bookmarks,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

export const isPostBookmarked = async (postId: string, userId: string) => {
  const bookmark = await db.bookmark.findFirst({
    where: {
      postId,
      userId,
    },
  })

  return !!bookmark
}
