"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/sdk", label: "TypeScript SDK" }, // <-- Add new SDK link here
  { href: "/docs/authentication", label: "Authentication" },
  {
    label: "API Endpoints",
    items: [
      { href: "/docs/endpoints/posts", label: "Posts" },
      { href: "/docs/endpoints/categories", label: "Categories" },
      { href: "/docs/endpoints/tags", label: "Tags" },
      { href: "/docs/endpoints/comments", label: "Comments" },
    ],
  },
  { href: "/docs/rate-limiting", label: "Rate Limiting" },
  { href: "/docs/errors", label: "Error Handling" },
  { href: "/docs/examples", label: "Full Examples" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 lg:w-72 md:shrink-0 py-10 md:sticky md:top-0 md:self-start">
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.href ? (
              <Link href={item.href}>
                <span
                  className={`px-3 py-2 block rounded-md text-sm transition-colors ${
                    pathname === item.href
                      ? "font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800"
                      : "font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ) : (
              <h4 className="px-3 pt-4 pb-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {item.label}
              </h4>
            )}
            {item.items && (
              <div className="flex flex-col mt-1 pl-5 border-l-2 border-gray-200 dark:border-gray-700">
                {item.items.map((subItem) => (
                  <Link key={subItem.label} href={subItem.href}>
                    <span
                      className={`block px-4 py-1.5 rounded-r-md text-sm transition-colors -ml-px border-l-2 ${
                        pathname === subItem.href
                          ? "font-semibold text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "font-normal text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {subItem.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}