import { db } from "@/lib/db"
import { cache } from "react"

export const getAllUsers = cache(async (page = 1, limit = 10, search = "", role = "") => {
  const skip = (page - 1) * limit

  // Build query
  const query: any = {}

  if (search) {
    query.OR = [{ name: { contains: search } }, { email: { contains: search } }]
  }

  if (role) {
    query.role = role
  }

  // Get users
  const users = await db.user.findMany({
    where: query,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  // Get total count
  const total = await db.user.count({
    where: query,
  })

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
})

export const getAdminStats = cache(async () => {
  const [totalUsers, totalPosts, totalViews, totalComments] = await Promise.all([
    db.user.count(),
    db.post.count(),
    db.postView.count(),
    db.comment.count(),
  ])

  // Get user growth
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const userGrowth = await db.user.groupBy({
    by: ["createdAt"],
    _count: true,
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Format user growth for chart
  const userGrowthFormatted = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    const dateString = date.toISOString().split("T")[0]

    const found = userGrowth.find((item) => item.createdAt.toISOString().split("T")[0] === dateString)

    return {
      date: dateString,
      users: found ? found._count : 0,
    }
  })

  // Get post growth
  const postGrowth = await db.post.groupBy({
    by: ["createdAt"],
    _count: true,
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Format post growth for chart
  const postGrowthFormatted = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    const dateString = date.toISOString().split("T")[0]

    const found = postGrowth.find((item) => item.createdAt.toISOString().split("T")[0] === dateString)

    return {
      date: dateString,
      posts: found ? found._count : 0,
    }
  })

  return {
    totalUsers,
    totalPosts,
    totalViews,
    totalComments,
    userGrowth: userGrowthFormatted,
    postGrowth: postGrowthFormatted,
  }
})
