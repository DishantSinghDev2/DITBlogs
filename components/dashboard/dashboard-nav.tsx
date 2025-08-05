"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  Palette,
  Globe,
  MessageSquare,
  Bell,
  Bookmark,
  PenTool,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardNavProps {
  userRole: string
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "editor", "writer", "user"],
    },
    {
      title: "Posts",
      href: "/dashboard/posts",
      icon: FileText,
      roles: ["admin", "editor", "writer", "user"],
    },
    {
      title: "Create Post",
      href: "/dashboard/editor",
      icon: PenTool,
      roles: ["admin", "editor", "writer"],
    },
    {
      title: "Comments",
      href: "/dashboard/comments",
      icon: MessageSquare,
      roles: ["admin", "editor", "writer", "user"],
    },
    {
      title: "Bookmarks",
      href: "/dashboard/bookmarks",
      icon: Bookmark,
      roles: ["admin", "editor", "writer", "user"],
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      roles: ["admin", "editor", "writer", "user"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin", "editor", "writer", "user"],
    },
    {
      title: "Admin",
      href: "/dashboard/admin",
      icon: BarChart3,
      roles: ["admin"],
      children: [
        {
          title: "Analytics",
          href: "/dashboard/admin/analytics",
          icon: BarChart3,
          roles: ["admin"],
        },
        {
          title: "Users",
          href: "/dashboard/admin/users",
          icon: Users,
          roles: ["admin"],
        },
        {
          title: "Settings",
          href: "/dashboard/admin/settings",
          icon: Settings,
          roles: ["admin"],
        },
        {
          title: "Appearance",
          href: "/dashboard/admin/appearance",
          icon: Palette,
          roles: ["admin"],
        },
        {
          title: "SEO",
          href: "/dashboard/admin/seo",
          icon: Globe,
          roles: ["admin"],
        },
      ],
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {navItems
        .filter((item) => item.roles.includes(userRole))
        .map((item) => (
          <div key={item.href}>
            <Button
              asChild
              variant={
                pathname === item.href || (item.children && item.children.some((child) => pathname === child.href))
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
            {item.children && (
              <div className="ml-4 mt-2 grid gap-1">
                {item.children
                  .filter((child) => child.roles.includes(userRole))
                  .map((child) => (
                    <Button
                      key={child.href}
                      asChild
                      variant={pathname === child.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Link href={child.href}>
                        <child.icon className="mr-2 h-4 w-4" />
                        {child.title}
                      </Link>
                    </Button>
                  ))}
              </div>
            )}
          </div>
        ))}
    </nav>
  )
}
