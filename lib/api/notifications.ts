import { db } from "@/lib/db";
import { cache } from "react";

export const getUserNotifications = cache(async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // 1. Fetch the paginated notifications, now including the actor's details
  const notifications = await db.notification.findMany({
    where: { userId },
    include: {
      // Directly include the user who performed the action
      actor: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  // 2. Efficiently fetch context for all notifications at once
  const commentIds = notifications
    .filter((n) => n.type === 'comment' || n.type === 'reply')
    .map((n) => n.relatedId)
    .filter((id): id is string => id !== null);

  let relatedComments: any[] = [];
  if (commentIds.length > 0) {
    relatedComments = await db.comment.findMany({
      where: { id: { in: commentIds } },
      select: {
        id: true, // The comment ID to map back
        post: {
          select: {
            slug: true, // The post slug for linking
          },
        },
      },
    });
  }

  // Create a quick lookup map for comment context
  const commentContextMap = new Map(
    relatedComments.map(c => [c.id, { postSlug: c.post.slug }])
  );

  // 3. Combine the notification with its context
  const enrichedNotifications = notifications.map(notification => ({
    ...notification,
    context: commentContextMap.get(notification.relatedId || '') || null,
  }));
  
  // 4. Get counts (these are fast and can run in parallel)
  const [total, unreadCount] = await Promise.all([
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, read: false } })
  ]);


  return {
    notifications: enrichedNotifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  };
});