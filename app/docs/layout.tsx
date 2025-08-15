"use client"; // Add this directive

import { Sidebar } from "@/components/docs/Sidebar";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          <Sidebar />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 md:pl-8 lg:pl-12 py-10"
          >
            <div className="prose prose-blue dark:prose-invert max-w-none">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}