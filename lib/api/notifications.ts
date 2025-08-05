import { db } from "@/lib/db"

export const getUserNotifications = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit

  const notifications = await db.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  const total = await db.notification.count({
    where: {
      userId,
    },
  })

  const unreadCount = await db.notification.count({
    where: {
      userId,
      read: false,
    },
  })

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  }
}
