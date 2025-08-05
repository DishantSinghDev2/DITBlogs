import { db } from "@/lib/db"
import { cache } from "react"

export const getAnalyticsData = cache(async () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const [
    totalUsers,
    newUsers,
    totalPosts,
    totalViews,
    totalComments,
    viewsByDay,
    postsByCategory,
    topPosts,
    topAuthors,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    db.post.count({
      where: {
        published: true,
      },
    }),
    db.postView.count(),
    db.comment.count(),
    db.postView.groupBy({
      by: ["createdAt"],
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    db.post.groupBy({
      by: ["categoryId"],
      _count: true,
      where: {
        published: true,
      },
    }),
    db.post.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: {
        views: {
          _count: "desc",
        },
      },
      take: 10,
    }),
    db.user.findMany({
      where: {
        posts: {
          some: {
            published: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: 10,
    }),
  ])

  // Get category names for postsByCategory
  const categories = await db.category.findMany({
    where: {
      id: {
        in: postsByCategory.map((item) => item.categoryId),
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  const postsByCategoryWithNames = postsByCategory.map((item) => ({
    category: categories.find((cat) => cat.id === item.categoryId)?.name || "Uncategorized",
    count: item._count,
  }))

  // Format viewsByDay for chart
  const viewsByDayFormatted = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    const dateString = date.toISOString().split("T")[0]

    const found = viewsByDay.find((item) => item.createdAt.toISOString().split("T")[0] === dateString)

    return {
      date: dateString,
      views: found ? found._count : 0,
    }
  })

  return {
    overview: {
      totalUsers,
      newUsers,
      totalPosts,
      totalViews,
      totalComments,
    },
    viewsByDay: viewsByDayFormatted,
    postsByCategory: postsByCategoryWithNames,
    topPosts,
    topAuthors,
  }
})
