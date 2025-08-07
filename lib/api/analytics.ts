import { db } from "@/lib/db";
import { cache } from "react";
import { startOfDay, endOfDay, subDays } from "date-fns";

// Renamed to be more explicit about its purpose
export const getOrganizationAnalytics = cache(async (organizationId: string, from?: Date, to?: Date) => {
  if (!organizationId) {
    return null;
  }

  // --- Date Range Handling ---
  const dateTo = to ? endOfDay(to) : new Date();
  const dateFrom = from ? startOfDay(from) : startOfDay(subDays(dateTo, 29));
  
  // All queries are now scoped to the organizationId and the selected date range
  const [
    totalMembers,
    totalPosts,
    totalViews,
    totalComments,
    viewsInRange, // We fetch raw views to process them correctly
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
    db.postView.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo }, post: { organizationId } },
      select: { createdAt: true },
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


  // --- FIX: Correctly process views by day ---
  const dailyViewsMap = new Map<string, number>();
  // Initialize all days in the range with 0 views
  for (let d = new Date(dateFrom); d <= dateTo; d.setDate(d.getDate() + 1)) {
      dailyViewsMap.set(d.toISOString().split('T')[0], 0);
  }
  // Aggregate the fetched views
  viewsInRange.forEach(view => {
      const day = view.createdAt.toISOString().split('T')[0];
      dailyViewsMap.set(day, (dailyViewsMap.get(day) || 0) + 1);
  });
  const viewsByDayFormatted = Array.from(dailyViewsMap.entries()).map(([date, views]) => ({ date, views }));


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
  
  return {
    overview: { totalMembers, totalPosts, totalViews, totalComments },
    charts: {
      viewsByDay: viewsByDayFormatted,
      postsByCategory: postsByCategoryWithNames,
      topAuthors,
    },
    tables: { topPosts }
  };
});