// /packages/blogs-react/src/components/CommentsSection.tsx
"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useDITBlogsContext } from '../provider'; // Use renamed hook
import { CommentsSectionSkeleton } from './skeletons';
import { CornerDownRight, Send } from 'lucide-react';
// --- Reusable Comment Form ---
function CommentForm({ postSlug, userToken, parentId, onCommentPosted }) {
    const { client } = useDITBlogsContext();
    const { mutate } = useSWRConfig();
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !userToken)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            await client.postComment({ postSlug, content, parentId, userToken });
            setContent("");
            onCommentPosted(); // Callback to hide form, etc.
            mutate(['comments', postSlug]); // Revalidate comments after posting
        }
        catch (err) {
            setError(err.message || "Failed to post comment.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "mt-4", children: [_jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), placeholder: parentId ? "Write your reply..." : "Join the discussion...", className: "w-full p-2 border rounded-md bg-muted focus:ring-2 focus:ring-primary outline-none", rows: 3, disabled: isSubmitting || !userToken }), userToken ? (_jsx("button", { type: "submit", disabled: isSubmitting || !content.trim(), className: "mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 flex items-center gap-2", children: isSubmitting ? "Posting..." : _jsxs(_Fragment, { children: [_jsx(Send, { size: 16 }), parentId ? "Post Reply" : "Post Comment"] }) })) : (_jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Please sign in to post a comment." })), error && _jsx("p", { className: "text-sm text-red-500 mt-1", children: error })] }));
}
// --- Component to Render a Single Comment and its Replies ---
function CommentItem({ comment, postSlug, userToken }) {
    const [isReplying, setIsReplying] = useState(false);
    return (_jsxs("div", { className: "flex items-start space-x-4 py-4", children: [_jsx("img", { src: `https://ui-avatars.com/api/?name=${comment.user.name}&background=random`, alt: comment.user.name || '', className: "w-10 h-10 rounded-full shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-foreground", children: comment.user.name }), _jsx("time", { className: "text-xs text-muted-foreground", children: new Date(comment.createdAt).toLocaleString() })] }), _jsx("p", { className: "mt-1 text-foreground", children: comment.content }), _jsxs("button", { onClick: () => setIsReplying(!isReplying), className: "mt-2 text-sm font-semibold text-primary flex items-center gap-1", children: [_jsx(CornerDownRight, { size: 14 }), " Reply"] }), isReplying && _jsx(CommentForm, { postSlug: postSlug, parentId: comment.id, userToken: userToken, onCommentPosted: () => setIsReplying(false) }), comment.replies?.length > 0 && (_jsx("div", { className: "mt-4 pl-6 border-l-2 border-muted", children: comment.replies.map(reply => _jsx(CommentItem, { comment: reply, postSlug: postSlug, userToken: userToken }, reply.id)) }))] })] }));
}
// --- The Main Exported Component ---
export function CommentsSection({ postSlug, userToken }) {
    const { client } = useDITBlogsContext();
    const { data: comments, error, isLoading } = useSWR(['comments', postSlug], () => client.getComments(postSlug));
    if (isLoading)
        return _jsx(CommentsSectionSkeleton, {});
    if (error)
        return _jsx("div", { className: "text-red-500 text-center py-4", children: "Could not load comments." });
    return (_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-bold mb-4", children: [comments?.length || 0, " Comments"] }), _jsx(CommentForm, { postSlug: postSlug, userToken: userToken, onCommentPosted: () => { } }), _jsx("div", { className: "mt-8 divide-y divide-muted", children: comments && comments.length > 0 ? (comments.map((comment) => _jsx(CommentItem, { comment: comment, postSlug: postSlug, userToken: userToken }, comment.id))) : (_jsx("p", { className: "text-center text-muted-foreground py-8", children: "No comments yet. Be the first to start the discussion!" })) })] }));
}
