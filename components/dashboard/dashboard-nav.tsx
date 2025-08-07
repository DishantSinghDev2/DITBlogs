"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  PenSquare,
  Bookmark,
  Building,
  Newspaper,
  MessageSquareText,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client"; // Import the enum

interface DashboardNavProps {
  userRole: UserRole | null;
}

// Define navigation items with logical grouping
const navGroups = [
  {
    title: "Content",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
      },
      {
        title: "Posts",
        href: "/dashboard/posts",
        icon: FileText,
        roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
      },
      {
        title: "Create Post",
        href: "/dashboard/editor", // A dedicated editor page is cleaner
        icon: PenSquare,
        roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
      },
      {
        title: "Comments",
        href: "/dashboard/comments", // A dedicated editor page is cleaner
        icon: MessageSquareText,
        roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
      },
      {
        title: "Notfications",
        href: "/dashboard/notifications", // A dedicated editor page is cleaner
        icon: BellRing,
        roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        title: "Members",
        href: "/dashboard/members",
        icon: Users,
        roles: [UserRole.ORG_ADMIN], // Only admins can see this
      },
      {
        title: "Newsletters",
        href: "/dashboard/newsletters",
        icon: Newspaper,
        roles: [UserRole.ORG_ADMIN], // Only admins can see this
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        roles: [UserRole.ORG_ADMIN], // Only admins can see this
      },
       {
        title: "Org Settings",
        href: "/dashboard/settings/organization",
        icon: Building,
        roles: [UserRole.ORG_ADMIN], // Only admins can see this
      },
    ],
  },
  {
    title: "Personal",
    items: [
        {
            title: "Bookmarks",
            href: "/dashboard/bookmarks",
            icon: Bookmark,
            roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
        },
        {
            title: "Profile Settings",
            href: "/dashboard/settings/profile",
            icon: Settings,
            roles: [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER],
        },
    ],
  },
];

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  if (!userRole) {
    return null; // Don't render nav if role is not determined
  }

  return (
    <nav className="flex flex-col gap-4 p-4 text-sm font-medium">
      {navGroups.map((group) => {
        // Filter items based on the user's role
        const accessibleItems = group.items.filter((item) =>
          item.roles.includes(userRole)
        );

        // Don't render the group if the user has no accessible items in it
        if (accessibleItems.length === 0) {
          return null;
        }

        return (
          <div key={group.title} className="grid gap-1">
            <h4 className="px-2 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {group.title}
            </h4>
            {accessibleItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        );
      })}
    </nav>
  );
}