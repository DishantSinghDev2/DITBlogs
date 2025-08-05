import { db } from "@/lib/db"
import { cache } from "react"

export const getUserRole = cache(async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  })

  return user?.role || "user"
})

export const checkUserRole = cache(async (userId: string, role: string) => {
  const userRole = await getUserRole(userId)
  return userRole === role
})

export const checkUserPermission = cache(async (userId: string, permission: string) => {
  const userRole = await getUserRole(userId)

  // Define permissions for each role
  const rolePermissions: Record<string, string[]> = {
    admin: ["create:post", "edit:post", "delete:post", "manage:users", "manage:settings"],
    editor: ["create:post", "edit:post", "delete:post"],
    writer: ["create:post", "edit:post"],
    user: [],
  }

  return rolePermissions[userRole]?.includes(permission) || false
})


// export function for getting user by id
export const getUserById = cache(async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      bio: true,
      website: true,
      emailVerified: true,
      notificationSettings: {
        select: {
          emailNotifications: true,
          marketingEmails: true,
          newComment: true,
          newFollower: true,
          newPost: true,
        },
      },
    },
  })

  return user
})