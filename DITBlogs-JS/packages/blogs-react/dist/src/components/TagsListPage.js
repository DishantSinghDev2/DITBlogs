// /packages/blogs-react/src/components/TagsListPage.tsx
// NEW COMPONENT
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider';
export function TagsListPage() {
    const { client } = useDITBlogsContext();
    const { data: tags, error, isLoading } = useSWR('tags', () => client.getTags());
    if (error)
        return _jsx("div", { className: "text-center text-red-500", children: "Failed to load tags." });
    if (isLoading) {
        return _jsx("div", { className: "text-center text-muted-foreground", children: "Loading tags..." });
    }
    if (!tags || tags.length === 0)
        return _jsx("div", { className: "text-center text-muted-foreground", children: "No tags found." });
    return (_jsx("div", { className: "flex flex-wrap items-center justify-center gap-4", children: tags.map((tag) => (_jsxs("a", { href: `/tags/${tag.slug}`, className: "px-4 py-2 text-sm font-medium border rounded-full bg-card hover:bg-primary hover:text-primary-foreground transition-colors", children: ["#", tag.name] }, tag.slug))) }));
}
