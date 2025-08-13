"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDITBlogsContext } from "../provider";
import { ArrowRight } from "lucide-react";
export function PostCard({ post }) {
    const { Link } = useDITBlogsContext();
    return (_jsxs(Link, { href: `/posts/${post.slug}`, className: "block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted", children: [_jsx("h3", { className: "text-2xl font-bold text-primary", children: post.title }), _jsx("p", { className: "text-muted-foreground mt-2", children: post.excerpt }), _jsxs("div", { className: "flex items-center justify-between mt-4 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["By ", post.author.name, " \u00B7 ", new Date(post.publishedAt).toLocaleDateString()] }), _jsxs("span", { className: "flex items-center gap-2 text-primary font-semibold", children: ["Read More ", _jsx(ArrowRight, { size: 16 })] })] })] }));
}
