import { db } from "@/lib/db";
import { cache } from "react";
import { UserRole } from "@prisma/client";

/**
 * Fetches a paginated list of users BELONGING TO A SPECIFIC ORGANIZATION.
 */
export const getAllUsersInOrg = cache(
  async (organizationId: string, page = 1, limit = 10, search = "", role = "") => {
    if (!organizationId) {
      return { users: [], pagination: { total: 0, page, limit, pages: 0 } };
    }

    const skip = (page - 1) * limit;

    // FIX: The query is now ALWAYS scoped by organizationId
    const query: any = {
      organizationId: organizationId,
    };

    if (search) {
      query.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role as UserRole;
    }

    const [users, total] = await db.$transaction([
        db.user.findMany({
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
                        // Count posts authored by this user within the same org
                        posts: { where: { organizationId } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        db.user.count({ where: query })
    ]);


    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
);

export const getPendingRequests = cache(async (organizationId: string) => {
    if (!organizationId) return [];

    const requests = await db.membershipRequest.findMany({
        where: {
            organizationId,
            status: 'PENDING',
        },
        include: {
            // Include the user's details to display in the table
            user: {
                select: { name: true, email: true, image: true },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    return requests;
});

/**
 * Fetches key statistics for A SPECIFIC ORGANIZATION.
 * Renamed from getAdminStats for clarity.
 */
export const getOrganizationStats = cache(async (organizationId: string) => {
    if (!organizationId) {
        return { totalUsers: 0, totalPosts: 0, totalViews: 0, totalComments: 0, postGrowth: [] };
    }

    // FIX: All queries are now scoped to the organizationId
    const [totalUsers, totalPosts, totalViews, totalComments] = await Promise.all([
        db.user.count({ where: { organizationId } }),
        db.post.count({ where: { organizationId } }),
        db.postView.count({ where: { post: { organizationId } } }), // Relational count
        db.comment.count({ where: { post: { organizationId } } }), // Relational count
    ]);

    // Get post growth for the last 30 days within the organization
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const postGrowth = await db.post.groupBy({
        by: ["createdAt"],
        _count: true,
        where: {
            organizationId, // Scoped to the organization
            createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "asc" },
    });

    // Format post growth for chart (your logic here is fine)
    const postGrowthFormatted = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split("T")[0];
        const found = postGrowth.find((item) => item.createdAt.toISOString().split("T")[0] === dateString);
        return { date: dateString, posts: found?._count || 0 };
    });

    return {
        totalUsers,
        totalPosts,
        totalViews,
        totalComments,
        postGrowth: postGrowthFormatted,
    };
});