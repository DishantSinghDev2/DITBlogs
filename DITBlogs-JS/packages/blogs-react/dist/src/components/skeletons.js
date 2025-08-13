import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// /packages/blogs-react/src/components/skeletons.tsx
/** A detailed skeleton for the single post page before content has loaded. */
export function PostDetailsSkeleton() {
    return (_jsxs("div", { className: "animate-pulse", children: [_jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [_jsx("div", { className: "h-6 w-1/4 bg-muted rounded mx-auto mb-4" }), _jsx("div", { className: "h-12 w-full bg-muted rounded mx-auto mb-6" }), _jsx("div", { className: "h-6 w-1/3 bg-muted rounded mx-auto" })] }), _jsx("div", { className: "prose dark:prose-invert lg:prose-xl mx-auto mt-12", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-6 w-full bg-muted rounded" }), _jsx("div", { className: "h-6 w-full bg-muted rounded" }), _jsx("div", { className: "h-6 w-11/12 bg-muted rounded" }), _jsx("br", {}), _jsx("div", { className: "h-6 w-full bg-muted rounded" }), _jsx("div", { className: "h-6 w-10/12 bg-muted rounded" })] }) })] }));
}
/** A skeleton for a single comment entry. */
export function CommentSkeleton() {
    return (_jsxs("div", { className: "flex items-start space-x-4 py-4 animate-pulse", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-muted shrink-0" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 w-1/4 bg-muted rounded" }), _jsx("div", { className: "h-4 w-full bg-muted rounded" }), _jsx("div", { className: "h-4 w-3/4 bg-muted rounded" })] })] }));
}
/** A skeleton for a single post card in a list. */
export function PostCardSkeleton() {
    return (_jsxs("div", { className: "p-6 border rounded-lg animate-pulse bg-card border-muted", children: [_jsx("div", { className: "h-8 w-3/4 bg-muted rounded mb-4" }), _jsx("div", { className: "h-4 w-full bg-muted rounded mb-2" }), _jsx("div", { className: "h-4 w-5/6 bg-muted rounded mb-4" }), _jsx("div", { className: "h-4 w-1/4 bg-muted rounded" })] }));
}
/** A skeleton for the entire comments section container. */
export function CommentsSectionSkeleton() {
    return (_jsxs("div", { className: "mt-8", children: [_jsx(CommentSkeleton, {}), _jsx("div", { className: "pl-14 border-l-2 border-muted ml-5", children: _jsx(CommentSkeleton, {}) }), _jsx(CommentSkeleton, {})] }));
}
