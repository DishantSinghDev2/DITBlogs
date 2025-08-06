import { db } from "@/lib/db";
import { cache } from "react";

// Renamed to be more explicit about its purpose
export const getOrganizationAnalytics = cache(async (organizationId: string) => {
  if (!organizationId) {
    return null; // Or return a default empty state
  }
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // All queries are now scoped to the organizationId
  const [
    totalMembers,
    totalPosts,
    totalViews,
    totalComments,
    viewsByDay,
    postsByCategory,
    topPosts,
    topAuthors,
  ] = await Promise.all([
    // Overview Cards
    db.user.count({ where: { organizationId } }),
    db.post.count({ where: { organizationId, published: true } }),
    db.postView.count({ where: { post: { organizationId } } }),
    db.comment.count({ where: { post: { organizationId } } }),
    
    // Charts and Tables Data
    db.postView.groupBy({
      by: ["createdAt"],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo }, post: { organizationId } },
      orderBy: { createdAt: "asc" },
    }),
    db.post.groupBy({
      by: ["categoryId"],
      _count: true,
      where: { organizationId, published: true, categoryId: { not: null } },
    }),
    db.post.findMany({
      where: { organizationId, published: true },
      select: { id: true, title: true, slug: true, _count: { select: { views: true } } },
      orderBy: { views: { _count: "desc" } },
      take: 5,
    }),
    db.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, image: true, _count: { select: { posts: { where: { organizationId } } } } },
      orderBy: { posts: { _count: "desc" } },
      take: 5,
    }),
  ]);

  // Process category names (your logic here is fine, but needs to handle null)
  const categoryIds = postsByCategory.map((item) => item.categoryId).filter(Boolean) as string[];
  const categories = await db.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const postsByCategoryWithNames = postsByCategory.map((item) => ({
    name: categories.find((cat) => cat.id === item.categoryId)?.name || "Uncategorized",
    value: item._count,
  }));

  // Format viewsByDay for chart (your logic here is fine)
  const viewsByDayFormatted = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i + 1); // Adjust for correct date mapping
    const dateString = date.toISOString().split("T")[0];
    const found = viewsByDay.find((item) => item.createdAt.toISOString().split("T")[0] === dateString);
    return { date: dateString, views: found?._count || 0 };
  });

  return {
    overview: {
      totalMembers,
      totalPosts,
      totalViews,
      totalComments,
    },
    charts: {
      viewsByDay: viewsByDayFormatted,
      postsByCategory: postsByCategoryWithNames,
      topAuthors,
    },
    tables: {
        topPosts
    }
  };
});