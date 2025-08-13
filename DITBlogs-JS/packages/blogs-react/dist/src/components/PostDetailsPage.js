// /packages/blogs-react/src/components/PostDetailsPage.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider'; // Use renamed hook
import { PostDetailsSkeleton } from './skeletons';
import { CommentsSection } from './CommentsSection'; // We will create this next
export function PostDetailsPage({ slug, userToken }) {
    const { client } = useDITBlogsContext();
    const { data: post, error, isLoading } = useSWR(['post', slug], () => client.getPost(slug));
    if (isLoading)
        return _jsx(PostDetailsSkeleton, {});
    if (error)
        return _jsx("div", { className: "text-center text-red-500 py-10", children: "Error loading post. Please try again later." });
    if (!post)
        return _jsx("div", { className: "text-center text-muted-foreground py-10", children: "404 | Post not found." });
    return (_jsxs("article", { children: [_jsxs("header", { className: "mb-12 text-center", children: [post.category && (_jsx("a", { href: `/categories/${post.category.slug}`, className: "text-primary font-semibold mb-2 block hover:underline", children: post.category.name })), _jsx("h1", { className: "text-4xl md:text-6xl font-extrabold text-foreground tracking-tight", children: post.title }), _jsxs("div", { className: "mt-6 text-muted-foreground", children: [_jsxs("span", { children: ["By ", post.author.name] }), " \u00B7 ", _jsxs("span", { children: ["Published on ", new Date(post.publishedAt).toLocaleDateString()] })] })] }), _jsx("div", { className: "prose dark:prose-invert lg:prose-xl mx-auto", dangerouslySetInnerHTML: { __html: post.content || '' } }), _jsxs("section", { id: "comments", className: "max-w-3xl mx-auto mt-20", children: [_jsx("h2", { className: "text-3xl font-bold mb-8 border-b pb-4 text-foreground", children: "Discussion" }), _jsx(CommentsSection, { postSlug: slug, userToken: userToken })] })] }));
}
