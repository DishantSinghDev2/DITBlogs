"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider';
import { PostCardSkeleton } from './skeletons';
import { Pagination } from './Pagination'; // Import Pagination
import { PostCard } from './PostCard';
export function CategoryPage({ slug }) {
    const { client } = useDITBlogsContext();
    const [currentPage, setCurrentPage] = useState(1);
    // This SWR hook now also depends on currentPage
    const { data, error, isLoading } = useSWR(['category', slug, currentPage], () => client.getCategory(slug, { page: currentPage }));
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };
    if (error)
        return _jsx("div", { className: "text-red-500 text-center", children: "Failed to load category information." });
    const categoryInfo = data?.category;
    return (_jsxs("div", { children: [_jsxs("header", { className: "mb-12 text-center", children: [isLoading && !categoryInfo ? (_jsx("div", { className: "h-10 w-1/3 bg-muted rounded mx-auto animate-pulse" })) : (_jsxs("h1", { className: "text-4xl font-extrabold text-foreground", children: ["Category: ", categoryInfo?.name] })), categoryInfo?.description && _jsx("p", { className: "mt-4 text-lg text-muted-foreground max-w-2xl mx-auto", children: categoryInfo.description })] }), isLoading ? (_jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [_jsx(PostCardSkeleton, {}), _jsx(PostCardSkeleton, {})] })) : data && data.posts.length > 0 ? (_jsxs("div", { children: [_jsx("div", { className: "grid md:grid-cols-2 gap-8", children: data.posts.map((post) => _jsx(PostCard, { post: post }, post.slug)) }), _jsx(Pagination, { currentPage: data.pagination.page, totalPages: data.pagination.pages, onPageChange: handlePageChange })] })) : (_jsx("div", { className: "text-center text-muted-foreground mt-16", children: "No posts found in this category." }))] }));
}
