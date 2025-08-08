import { db } from "@/lib/db";
import { cache } from "react";

/**
 * Fetches key statistics for a given organization.
 */
export const getUserStats = cache(async (organizationId: string) => {
  if (!organizationId) return { postCount: 0, viewCount: 0, commentCount: 0, draftCount: 0 };

  const [postCount, viewCount, commentCount, draftCount] = await Promise.all([
    // Count all posts in the organization
    db.post.count({
      where: { organizationId },
    }),
    // Sum all views for posts within the organization
    db.postView.count({
      where: { post: { organizationId } },
    }),
    // Sum all comments for posts within the organization
    db.comment.count({
      where: { post: { organizationId } },
    }),
    db.draft.count({
      where: { organizationId, },
    })
  ]);

  return { postCount, viewCount, commentCount, draftCount };
});

/**
 * Fetches the 5 most recent published posts for an organization.
 */
export const getRecentPosts = cache(async (organizationId: string) => {
  if (!organizationId) return [];

  const posts = await db.post.findMany({
    where: {
      organizationId,
    },
    // FIX: Update the 'select' and 'include' clauses
    select: {
      id: true,
      title: true,
      slug: true,
      // The component uses publishedAt, not createdAt for this display
      publishedAt: true, 
      // Include the category relation to get its name
      category: {
        select: {
          name: true,
        },
      },
      // Select the count of both views and comments
      _count: {
        select: {
          views: true,
          comments: true,
        },
      },
      createdAt: true
    },
    orderBy: {
      // Order by the date it was published
      publishedAt: "desc",
    },
    take: 5,
  });

  return posts;
});

/**
 * Fetches the 5 most recent draft posts for an organization.
 */
export const getDraftPosts = cache(async (organizationId: string) => {
  if (!organizationId) return [];

  const posts = await db.draft.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      author: {
        select: { name: true, image: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  return posts;
});