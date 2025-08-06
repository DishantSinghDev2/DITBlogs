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
    action: "post:create" | "post:edit" | "post:delete" | "org:manage_members" | "org:edit_settings",
    resourceId: string // This will be organizationId for 'post:create' or postId for others
  ): Promise<boolean> => {
    if (!userId || !action || !resourceId) return false;

    let organizationId: string | null = null;
    let postAuthorId: string | null = null;

    // --- FIX: Reworked logic to handle different actions ---
    if (action === "post:create") {
      // For creating a post, the resourceId IS the organizationId.
      organizationId = resourceId;
    } else if (action === "post:edit" || action === "post:delete") {
      // For editing/deleting, we need to find the post's organization.
      const post = await db.post.findUnique({
        where: { id: resourceId },
        select: { organizationId: true, authorId: true },
      });
      if (!post) return false; // Post doesn't exist
      organizationId = post.organizationId;
      postAuthorId = post.authorId;
    } else if (action.startsWith("org:")) {
      // For organization actions, the resourceId IS the organizationId.
      organizationId = resourceId;
    }

    // If we couldn't determine an organization, deny permission.
    if (!organizationId) {
      console.error(`Could not determine organizationId for action: ${action}`);
      return false;
    }

    // --- The rest of the logic remains the same and is now correct ---

    // 2. Get the user's role within that specific organization
    const user = await db.user.findFirst({
      where: { id: userId, organizationId: organizationId },
      select: { role: true },
    });

    const userRole = user?.role;
    if (!userRole) return false; // User is not a member of the relevant organization

    // 3. Define permissions and check if the user's role has the permission
    const permissions: Record<UserRole, string[]> = {
      ORG_ADMIN: [
        "post:create",
        "post:edit",
        "post:delete",
        "org:manage_members",
        "org:edit_settings",
      ],
      EDITOR: ["post:create", "post:edit", "post:delete"],
      WRITER: ["post:create", "post:edit", "post:delete"],
    };
    
    // Check general role-based permission
    if (permissions[userRole]?.includes(action)) {
        // Special case for writers: they can only edit/delete their own posts
        if (userRole === 'WRITER' && (action === 'post:edit' || action === 'post:delete')) {
            return postAuthorId === userId;
        }
        // Admins and Editors have full access for their respective permissions
        return true;
    }

    return false;
  }
);