// /app/docs/layout.tsx
import { Sidebar } from "@/components/docs/Sidebar";
import { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 md:pl-8 lg:pl-12 py-10">
            <div className="prose prose-blue dark:prose-invert max-w-none">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}