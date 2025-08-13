// /packages/blogs-react/src/components/PostsListPage.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { useDITBlogsContext } from "../provider"; // Use the renamed hookimport { PostCardSkeleton } from "./skeletons"; // Skeletons are crucial!
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { Pagination } from "./Pagination";
import { PostCardSkeleton } from "./skeletons";
// Debounce hook for search input
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}
function SearchBar({ onSearchChange }) {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    useEffect(() => {
        onSearchChange(debouncedQuery);
    }, [debouncedQuery, onSearchChange]);
    return (_jsxs("div", { className: "relative w-full max-w-md mx-auto mb-12", children: [_jsx(SearchIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search for posts...", className: "w-full pl-10 pr-4 py-2 border rounded-lg bg-background" })] }));
}
function PostCard({ post }) {
    return (_jsxs("a", { href: `/posts/${post.slug}`, className: "block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted", children: [_jsx("h3", { className: "text-2xl font-bold text-primary", children: post.title }), _jsx("p", { className: "text-muted-foreground mt-2", children: post.excerpt }), _jsxs("div", { className: "flex items-center justify-between mt-4 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["By ", post.author.name, " \u00B7 ", new Date(post.publishedAt).toLocaleDateString()] }), _jsxs("span", { className: "flex items-center gap-2 text-primary font-semibold", children: ["Read More ", _jsx(ArrowRight, { size: 16 })] })] })] }));
}
export function PostsListPage({ category, tag }) {
    const { client } = useDITBlogsContext();
    const [currentPage, setCurrentPage] = useState(1);
    const { data, error, isLoading } = useSWR(["posts", category, tag, currentPage], () => client.getPosts({ category, tag, page: currentPage }));
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0); // Scroll to top on page change
    };
    if (error)
        return _jsx("div", { className: "text-center text-red-500", children: "Failed to load posts." });
    if (isLoading) {
        return (_jsx("div", { className: "grid md:grid-cols-2 gap-8", children: [...Array(6)].map((_, i) => _jsx(PostCardSkeleton, {}, i)) }));
    }
    if (!data || data.posts.length === 0)
        return _jsx("div", { className: "text-center text-muted-foreground mt-16", children: "No posts found." });
    return (_jsxs("div", { children: [_jsx("div", { className: "grid md:grid-cols-2 gap-8", children: data.posts.map((post) => _jsx(PostCard, { post: post }, post.slug)) }), _jsx(Pagination, { currentPage: data.pagination.page, totalPages: data.pagination.pages, onPageChange: handlePageChange })] }));
}
