'use client'

import { useState, type ReactNode } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Sidebar as SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserRole } from "@prisma/client"

export function DashboardShell({
  userRole,
  children,
}: {
  userRole: UserRole | null; // Use the specific enum type
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-y-auto">
      {/* Mobile toggle button */}
      <div className="md:hidden p-4">
        <Button
          variant="ghost"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main layout with sidebar + content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`z-50 w-64 bg-white dark:bg-zinc-900 p-4 bg-background/80 backdrop-blur-sm border transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:block ${
            sidebarOpen ? "fixed top-0 left-0 h-full pt-14 translate-x-0" : "hidden md:block"
          }`}
        >
          <DashboardNav userRole={userRole} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
