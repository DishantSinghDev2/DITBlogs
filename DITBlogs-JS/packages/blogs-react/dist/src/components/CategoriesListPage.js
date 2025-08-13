// /packages/blogs-react/src/components/CategoriesListPage.tsx
// NEW COMPONENT
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider';
import { Tag as CategoryIcon } from 'lucide-react'; // Using Tag icon for visual consistency
export function CategoriesListPage() {
    const { client } = useDITBlogsContext();
    const { data: categories, error, isLoading } = useSWR('categories', () => client.getCategories());
    if (error)
        return _jsx("div", { className: "text-center text-red-500", children: "Failed to load categories." });
    // Skeleton state for categories
    if (isLoading) {
        return (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [...Array(8)].map((_, i) => (_jsx("div", { className: "p-6 bg-muted rounded-lg animate-pulse h-24" }, i))) }));
    }
    if (!categories || categories.length === 0)
        return _jsx("div", { className: "text-center text-muted-foreground", children: "No categories found." });
    return (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: categories.map((category) => (_jsxs("a", { href: `/categories/${category.slug}`, className: "group flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-muted transition-colors", children: [_jsx(CategoryIcon, { className: "w-5 h-5 text-primary" }), _jsx("span", { className: "font-semibold text-card-foreground group-hover:text-primary", children: category.name })] }, category.slug))) }));
}
