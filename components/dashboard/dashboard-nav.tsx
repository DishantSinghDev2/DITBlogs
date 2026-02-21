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
  LayoutList,
  DollarSign,
  Key,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";

interface DashboardNavProps {
  userRole: UserRole | null;
}

const ALL_ROLES = [UserRole.ORG_ADMIN, UserRole.EDITOR, UserRole.WRITER];
const ADMIN_EDITOR = [UserRole.ORG_ADMIN, UserRole.EDITOR];
const ADMIN_ONLY = [UserRole.ORG_ADMIN];

const navGroups = [
  {
    title: "Content",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ALL_ROLES,
      },
      {
        title: "Posts",
        href: "/dashboard/posts",
        icon: FileText,
        // All roles see Posts.
        // Editors/admins see all org posts; writers see their own.
        // That scoping is handled server-side in getUserContent.
        roles: ALL_ROLES,
      },
      {
        title: "Comments",
        href: "/dashboard/comments",
        icon: MessageSquareText,
        roles: ALL_ROLES,
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: BellRing,
        roles: ALL_ROLES,
      },
      {
        title: "Categories",
        href: "/dashboard/categories",
        icon: LayoutList,
        // Writers cannot create/manage categories
        roles: ADMIN_EDITOR,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        // Writers can view their own post analytics;
        // Editors/admins see org-wide analytics.
        // The analytics page itself should scope the data by role.
        roles: ALL_ROLES,
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
        roles: ADMIN_ONLY,
      },
      {
        title: "Newsletters",
        href: "/dashboard/newsletters",
        icon: Newspaper,
        roles: ADMIN_ONLY,
      },
      {
        title: "Plan",
        href: "/dashboard/settings/plan",
        icon: DollarSign,
        roles: ADMIN_ONLY,
      },
      {
        title: "Org Settings",
        href: "/dashboard/settings/organization",
        icon: Building,
        roles: ADMIN_ONLY,
      },
    ],
  },
  {
    title: "Developer",
    items: [
      {
        title: "API Keys",
        href: "/dashboard/developer/api",
        icon: Key,
        roles: ADMIN_ONLY,
      },
      {
        title: "Webhooks",
        href: "/dashboard/developer/webhooks",
        icon: Webhook,
        roles: ADMIN_ONLY,
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
        roles: ALL_ROLES,
      },
      {
        title: "Profile Settings",
        href: "/dashboard/settings/profile",
        icon: Settings,
        roles: ALL_ROLES,
      },
    ],
  },
];

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  if (!userRole) {
    return null;
  }

  return (
    <nav className="flex flex-col gap-4 p-4 text-sm font-medium">
      {navGroups.map((group) => {
        const accessibleItems = group.items.filter((item) =>
          item.roles.includes(userRole)
        );

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