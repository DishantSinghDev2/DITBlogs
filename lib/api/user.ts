import { db } from "@/lib/db";
import { cache } from "react";
import { UserRole } from "@prisma/client"; // Import the UserRole enum

/**
 * Retrieves a user's public profile and their organization details.
 * This is the primary function for fetching user data for display.
 */
export const getUserById = cache(async (userId: string) => {
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true, // Note: Be careful about exposing email publicly
      image: true,
      bio: true,
      createdAt: true,
      // The user's role within their organization
      role: true,
      // Details about the organization the user belongs to
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      // Details about the organization the user owns
      ownedOrganization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return user;
});

/**
 * Gets a user's specific role within a given organization.
 * Returns the role if they are a member, otherwise returns null.
 */
export const getUserRoleInOrg = cache(
  async (userId: string, organizationId: string) => {
    if (!userId || !organizationId) return null;

    const user = await db.user.findFirst({
      where: {
        id: userId,
        organizationId: organizationId, // Check they belong to THIS org
      },
      select: {
        role: true,
      },
    });


    return user?.role || null;
  }
);

/**
 * The primary permission checking function for your application.
 * Determines if a user can perform a specific action on a resource.
 *
 * @example
 * const canEdit = await canUserPerformAction(userId, 'post:edit', postId);
 * const canManageMembers = await canUserPerformAction(userId, 'org:manage_members', orgId);
 */

export const canUserPerformAction = cache(
  async (
    userId: string,
    // --- FIX: Add the new permission ---
    action: "post:create" | "post:edit" | "post:delete" | "draft:edit" | "org:manage_members" | "org:edit_settings" | "org:manage_categories",
    resourceId: string 
  ): Promise<boolean> => {
    if (!userId || !action || !resourceId) return false;

    let organizationId: string | null = null;
    let authorId: string | null = null; // Use a generic authorId

    // --- FIX: Add logic for the new draft:edit action ---
    if (action === "draft:edit") {
        const draft = await db.draft.findUnique({
            where: { id: resourceId },
            select: { organizationId: true, authorId: true },
        });
        if (!draft) return false;
        organizationId = draft.organizationId;
        authorId = draft.authorId;
    } else if (action === "post:edit" || action === "post:delete") {
        const post = await db.post.findUnique({
            where: { id: resourceId },
            select: { organizationId: true, authorId: true },
        });
        if (!post) return false;
        organizationId = post.organizationId;
        authorId = post.authorId;
    } else if (action === "post:create" || action.startsWith("org:")) {
        organizationId = resourceId;
    }

    if (!organizationId) return false;

    const user = await db.user.findFirst({
      where: { id: userId, organizationId: organizationId },
      select: { role: true },
    });
    const userRole = user?.role;
    if (!userRole) return false;

    // --- FIX: Add the new permission to the roles ---
    const permissions: Record<UserRole, string[]> = {
      ORG_ADMIN: [ "post:create", "post:edit", "post:delete", "draft:edit", "org:manage_members", "org:edit_settings", "org:manage_categories"  ],
      EDITOR: ["post:create", "post:edit", "post:delete", "draft:edit", "org:manage_categories"  ],
      WRITER: ["post:create", "post:edit", "post:delete", "draft:edit"],
    };
    
    if (permissions[userRole]?.includes(action)) {
        // --- FIX: Apply author-only logic to both post and draft edits for WRITER role ---
        if (userRole === 'WRITER' && (action === 'post:edit' || action === 'post:delete' || action === 'draft:edit')) {
            return authorId === userId;
        }
        return true;
    }

    return false;
  }
);
