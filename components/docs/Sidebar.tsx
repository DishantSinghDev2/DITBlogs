"use client";
// /components/docs/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/authentication", label: "Authentication" },
  {
    label: "Endpoints",
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
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.href ? (
              <Link href={item.href}>
                <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-white bg-blue-600"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}>
                  {item.label}
                </span>
              </Link>
            ) : (
              <h4 className="px-3 pt-4 pb-2 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                {item.label}
              </h4>
            )}
            {item.items && (
              <div className="flex flex-col space-y-2 mt-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                {item.items.map((subItem) => (
                  <Link key={subItem.label} href={subItem.href}>
                    <span className={`block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      pathname === subItem.href
                        ? "text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}>
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