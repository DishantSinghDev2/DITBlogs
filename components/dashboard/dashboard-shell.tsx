"use client";

import { useState, type ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { PenTool, Sidebar as SidebarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type UserRole } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import Link from "next/link";

export function DashboardShell({
  userRole,
  children,
}: {
  userRole: UserRole | null;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define animation variants for the sidebar
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  return (
    <div className="relative flex min-h-screen w-full bg-muted/40">
      {/* --- Desktop Sidebar --- */}
      {/* This is fixed on the left for medium screens and up */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16">
        <div className="flex h-full max-h-screen flex-col border-r bg-background">
          <div className="p-4 ">
            <Link href={"/dashboard/editor"}>
              <Button className="w-full">
                <PenTool className="w-4 h-4" />
                Create Post
              </Button>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto scrollable">
            <DashboardNav userRole={userRole} />
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      {/* This is pushed to the right to make space for the desktop sidebar */}
      <div className="flex flex-col w-full md:pl-64">
        {/* Mobile Header with Hamburger Icon */}
        <header className="sticky top-5 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <SidebarIcon className="h-5 w-5" />
          </Button>
        </header>

        {/* The actual page content */}
        <main className="flex-1 p-1 sm:px-2 sm:py-0 md:p-4 ">{children}</main>
      </div>

      {/* --- Mobile Sidebar with Animation --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0  z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar itself */}
            <motion.aside
              key="mobile-sidebar"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 top-16 left-0 z-50 flex h-full w-64 flex-col border-r bg-background md:hidden"
            >
              <Button
                variant="outline"
                size="icon"
                className="m-2 h-8 w-8 "
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close Menu</span>
              </Button>
              <div className="flex-1 overflow-y-auto scrollable">
                <DashboardNav userRole={userRole} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}