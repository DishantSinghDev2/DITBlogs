"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BlogLayout: () => BlogLayout,
  CategoriesListPage: () => CategoriesListPage,
  CategoryPage: () => CategoryPage,
  CommentSkeleton: () => CommentSkeleton,
  CommentsSection: () => CommentsSection,
  CommentsSectionSkeleton: () => CommentsSectionSkeleton,
  DITBlogsProvider: () => DITBlogsProvider,
  Pagination: () => Pagination,
  PostCardSkeleton: () => PostCardSkeleton,
  PostDetailsPage: () => PostDetailsPage,
  PostDetailsSkeleton: () => PostDetailsSkeleton,
  PostsListPage: () => PostsListPage,
  TagsListPage: () => TagsListPage,
  darkTheme: () => darkTheme,
  lightTheme: () => lightTheme,
  useDITBlogsContext: () => useDITBlogsContext
});
module.exports = __toCommonJS(index_exports);

// src/provider.tsx
var import_blogs_sdk = require("@dishistech/blogs-sdk");
var import_react = require("react");
var import_swr = require("swr");

// src/theme.ts
var lightTheme = {
  colors: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(240 10% 3.9%)",
    primary: "hsl(221 83% 53%)",
    primaryForeground: "hsl(60 9% 98%)",
    muted: "hsl(240 5% 96%)",
    mutedForeground: "hsl(240 4% 46%)"
  }
};
var darkTheme = {
  colors: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(240 10% 3.9%)",
    cardForeground: "hsl(0 0% 98%)",
    primary: "hsl(217 91% 60%)",
    primaryForeground: "hsl(210 20% 98%)",
    muted: "hsl(240 4% 16%)",
    mutedForeground: "hsl(240 5% 65%)"
  }
};

// src/provider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var DITBlogsContext = (0, import_react.createContext)(null);
function useDITBlogsContext() {
  const context = (0, import_react.useContext)(DITBlogsContext);
  if (!context) throw new Error("useDITBlogsContext must be used within a DITBlogsProvider");
  return context;
}
function DITBlogsProvider({ children, apiKey, theme = "light", linkComponent = "a" }) {
  const client = (0, import_react.useMemo)(() => new import_blogs_sdk.DITBlogsClient(apiKey), [apiKey]);
  (0, import_react.useEffect)(() => {
    const root = document.documentElement;
    const selectedTheme = theme === "light" ? lightTheme : theme === "dark" ? darkTheme : theme;
    root.style.setProperty("--background", selectedTheme.colors.background);
    root.style.setProperty("--foreground", selectedTheme.colors.foreground);
    root.style.setProperty("--card", selectedTheme.colors.card);
    root.style.setProperty("--card-foreground", selectedTheme.colors.cardForeground);
    root.style.setProperty("--primary", selectedTheme.colors.primary);
    root.style.setProperty("--primary-foreground", selectedTheme.colors.primaryForeground);
    root.style.setProperty("--muted", selectedTheme.colors.muted);
    root.style.setProperty("--muted-foreground", selectedTheme.colors.mutedForeground);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);
  const value = { client, Link: linkComponent };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DITBlogsContext.Provider, { value, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_swr.SWRConfig, { children }) });
}

// src/layout/BlogLayout.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function Header({ navLinks }) {
  const { Link } = useDITBlogsContext();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("header", { className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("nav", { className: "container mx-auto px-6 h-16 flex items-center justify-between", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Link, { href: "/", className: "text-2xl font-bold text-foreground", children: "My Blog" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex items-center gap-6", children: navLinks?.map((link) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Link, { href: link.href, className: "text-sm font-medium text-muted-foreground hover:text-foreground", children: link.label }, link.href)) })
  ] }) });
}
function Footer() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("footer", { className: "border-t mt-16", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "container mx-auto px-6 py-8 text-center text-sm text-muted-foreground", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { children: [
      "\xA9 ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " My Company, Inc. All Rights Reserved."
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "mt-2", children: [
      "Powered by ",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href: "https://blogs.dishis.tech", target: "_blank", rel: "noopener noreferrer", className: "font-semibold text-primary hover:underline", children: "blogs.dishis.tech" })
    ] })
  ] }) });
}
function BlogLayout({ children, apiKey, theme, navLinks, linkComponent }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(DITBlogsProvider, { apiKey, theme, linkComponent, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Header, { navLinks }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("main", { className: "flex-grow container mx-auto px-6 py-12", children }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Footer, {})
  ] }) });
}

// src/components/PostsListPage.tsx
var import_react2 = require("react");
var import_swr2 = __toESM(require("swr"));
var import_lucide_react2 = require("lucide-react");

// src/components/Pagination.tsx
var import_lucide_react = require("lucide-react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("nav", { className: "flex items-center justify-between mt-12", "aria-label": "Pagination", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "button",
      {
        onClick: handlePrevious,
        disabled: currentPage === 1,
        className: "px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronLeft, { size: 16 }),
          "Previous"
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-sm text-muted-foreground", children: [
      "Page ",
      currentPage,
      " of ",
      totalPages
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "button",
      {
        onClick: handleNext,
        disabled: currentPage === totalPages,
        className: "px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2",
        children: [
          "Next",
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronRight, { size: 16 })
        ]
      }
    )
  ] });
}

// src/components/skeletons.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function PostDetailsSkeleton() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "animate-pulse", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "max-w-2xl mx-auto text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-1/4 bg-muted rounded mx-auto mb-4" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-12 w-full bg-muted rounded mx-auto mb-6" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-1/3 bg-muted rounded mx-auto" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "prose dark:prose-invert lg:prose-xl mx-auto mt-12", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-full bg-muted rounded" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-full bg-muted rounded" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-11/12 bg-muted rounded" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("br", {}),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-full bg-muted rounded" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-10/12 bg-muted rounded" })
    ] }) })
  ] });
}
function CommentSkeleton() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-start space-x-4 py-4 animate-pulse", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "w-10 h-10 rounded-full bg-muted shrink-0" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-4 w-1/4 bg-muted rounded" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-4 w-full bg-muted rounded" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-4 w-3/4 bg-muted rounded" })
    ] })
  ] });
}
function PostCardSkeleton() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "p-6 border rounded-lg animate-pulse bg-card border-muted", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-8 w-3/4 bg-muted rounded mb-4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-4 w-full bg-muted rounded mb-2" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-4 w-5/6 bg-muted rounded mb-4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-4 w-1/4 bg-muted rounded" })
  ] });
}
function CommentsSectionSkeleton() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-8", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CommentSkeleton, {}),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "pl-14 border-l-2 border-muted ml-5", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CommentSkeleton, {}) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CommentSkeleton, {})
  ] });
}

// src/components/PostsListPage.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function PostCard({ post }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("a", { href: `/posts/${post.slug}`, className: "block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "text-2xl font-bold text-primary", children: post.title }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-muted-foreground mt-2", children: post.excerpt }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center justify-between mt-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
        "By ",
        post.author.name,
        " \xB7 ",
        new Date(post.publishedAt).toLocaleDateString()
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "flex items-center gap-2 text-primary font-semibold", children: [
        "Read More ",
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react2.ArrowRight, { size: 16 })
      ] })
    ] })
  ] });
}
function PostsListPage({ category, tag }) {
  const { client } = useDITBlogsContext();
  const [currentPage, setCurrentPage] = (0, import_react2.useState)(1);
  const { data, error, isLoading } = (0, import_swr2.default)(
    ["posts", category, tag, currentPage],
    () => client.getPosts({ category, tag, page: currentPage })
  );
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-center text-red-500", children: "Failed to load posts." });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "grid md:grid-cols-2 gap-8", children: [...Array(6)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PostCardSkeleton, {}, i)) });
  }
  if (!data || data.posts.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-center text-muted-foreground mt-16", children: "No posts found." });
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "grid md:grid-cols-2 gap-8", children: data.posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PostCard, { post }, post.slug)) }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      Pagination,
      {
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        onPageChange: handlePageChange
      }
    )
  ] });
}

// src/components/PostDetailsPage.tsx
var import_swr4 = __toESM(require("swr"));

// src/components/CommentsSection.tsx
var import_react3 = require("react");
var import_swr3 = __toESM(require("swr"));
var import_lucide_react3 = require("lucide-react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function CommentForm({ postSlug, userToken, parentId, onCommentPosted }) {
  const { client } = useDITBlogsContext();
  const { mutate } = (0, import_swr3.useSWRConfig)();
  const [content, setContent] = (0, import_react3.useState)("");
  const [error, setError] = (0, import_react3.useState)(null);
  const [isSubmitting, setIsSubmitting] = (0, import_react3.useState)(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !userToken) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await client.postComment({ postSlug, content, parentId, userToken });
      setContent("");
      onCommentPosted();
      mutate(["comments", postSlug]);
    } catch (err) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("form", { onSubmit: handleSubmit, className: "mt-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "textarea",
      {
        value: content,
        onChange: (e) => setContent(e.target.value),
        placeholder: parentId ? "Write your reply..." : "Join the discussion...",
        className: "w-full p-2 border rounded-md bg-muted focus:ring-2 focus:ring-primary outline-none",
        rows: 3,
        disabled: isSubmitting || !userToken
      }
    ),
    userToken ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "submit", disabled: isSubmitting || !content.trim(), className: "mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 flex items-center gap-2", children: isSubmitting ? "Posting..." : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Send, { size: 16 }),
      parentId ? "Post Reply" : "Post Comment"
    ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-sm text-muted-foreground mt-2", children: "Please sign in to post a comment." }),
    error && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-sm text-red-500 mt-1", children: error })
  ] });
}
function CommentItem({ comment, postSlug, userToken }) {
  const [isReplying, setIsReplying] = (0, import_react3.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-start space-x-4 py-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("img", { src: `https://ui-avatars.com/api/?name=${comment.user.name}&background=random`, alt: comment.user.name || "", className: "w-10 h-10 rounded-full shrink-0" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "font-bold text-foreground", children: comment.user.name }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("time", { className: "text-xs text-muted-foreground", children: new Date(comment.createdAt).toLocaleString() })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-1 text-foreground", children: comment.content }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { onClick: () => setIsReplying(!isReplying), className: "mt-2 text-sm font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.CornerDownRight, { size: 14 }),
        " Reply"
      ] }),
      isReplying && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CommentForm, { postSlug, parentId: comment.id, userToken, onCommentPosted: () => setIsReplying(false) }),
      comment.replies?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "mt-4 pl-6 border-l-2 border-muted", children: comment.replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CommentItem, { comment: reply, postSlug, userToken }, reply.id)) })
    ] })
  ] });
}
function CommentsSection({ postSlug, userToken }) {
  const { client } = useDITBlogsContext();
  const { data: comments, error, isLoading } = (0, import_swr3.default)(["comments", postSlug], () => client.getComments(postSlug));
  if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CommentsSectionSkeleton, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-red-500 text-center py-4", children: "Could not load comments." });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h3", { className: "text-xl font-bold mb-4", children: [
      comments?.length || 0,
      " Comments"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CommentForm, { postSlug, userToken, onCommentPosted: () => {
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "mt-8 divide-y divide-muted", children: comments && comments.length > 0 ? comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CommentItem, { comment, postSlug, userToken }, comment.id)) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-center text-muted-foreground py-8", children: "No comments yet. Be the first to start the discussion!" }) })
  ] });
}

// src/components/PostDetailsPage.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function PostDetailsPage({ slug, userToken }) {
  const { client } = useDITBlogsContext();
  const { data: post, error, isLoading } = (0, import_swr4.default)(["post", slug], () => client.getPost(slug));
  if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(PostDetailsSkeleton, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-center text-red-500 py-10", children: "Error loading post. Please try again later." });
  if (!post) return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-center text-muted-foreground py-10", children: "404 | Post not found." });
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("article", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("header", { className: "mb-12 text-center", children: [
      post.category && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("a", { href: `/categories/${post.category.slug}`, className: "text-primary font-semibold mb-2 block hover:underline", children: post.category.name }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h1", { className: "text-4xl md:text-6xl font-extrabold text-foreground tracking-tight", children: post.title }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-6 text-muted-foreground", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
          "By ",
          post.author.name
        ] }),
        " \xB7 ",
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
          "Published on ",
          new Date(post.publishedAt).toLocaleDateString()
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        className: "prose dark:prose-invert lg:prose-xl mx-auto",
        dangerouslySetInnerHTML: { __html: post.content || "" }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { id: "comments", className: "max-w-3xl mx-auto mt-20", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-3xl font-bold mb-8 border-b pb-4 text-foreground", children: "Discussion" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CommentsSection, { postSlug: slug, userToken })
    ] })
  ] });
}

// src/components/CategoryPage.tsx
var import_react4 = require("react");
var import_swr5 = __toESM(require("swr"));

// src/components/PostCard.tsx
var import_lucide_react4 = require("lucide-react");
var import_jsx_runtime8 = require("react/jsx-runtime");
function PostCard2({ post }) {
  const { Link } = useDITBlogsContext();
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Link, { href: `/posts/${post.slug}`, className: "block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { className: "text-2xl font-bold text-primary", children: post.title }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-muted-foreground mt-2", children: post.excerpt }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between mt-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
        "By ",
        post.author.name,
        " \xB7 ",
        new Date(post.publishedAt).toLocaleDateString()
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "flex items-center gap-2 text-primary font-semibold", children: [
        "Read More ",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react4.ArrowRight, { size: 16 })
      ] })
    ] })
  ] });
}

// src/components/CategoryPage.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function CategoryPage({ slug }) {
  const { client } = useDITBlogsContext();
  const [currentPage, setCurrentPage] = (0, import_react4.useState)(1);
  const { data, error, isLoading } = (0, import_swr5.default)(["category", slug, currentPage], () => client.getCategory(slug, { page: currentPage }));
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-red-500 text-center", children: "Failed to load category information." });
  const categoryInfo = data?.category;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("header", { className: "mb-12 text-center", children: [
      isLoading && !categoryInfo ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "h-10 w-1/3 bg-muted rounded mx-auto animate-pulse" }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("h1", { className: "text-4xl font-extrabold text-foreground", children: [
        "Category: ",
        categoryInfo?.name
      ] }),
      categoryInfo?.description && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "mt-4 text-lg text-muted-foreground max-w-2xl mx-auto", children: categoryInfo.description })
    ] }),
    isLoading ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "grid md:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PostCardSkeleton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PostCardSkeleton, {})
    ] }) : data && data.posts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "grid md:grid-cols-2 gap-8", children: data.posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PostCard2, { post }, post.slug)) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        Pagination,
        {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange
        }
      )
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-center text-muted-foreground mt-16", children: "No posts found in this category." })
  ] });
}

// src/components/TagsListPage.tsx
var import_swr6 = __toESM(require("swr"));
var import_jsx_runtime10 = require("react/jsx-runtime");
function TagsListPage() {
  const { client } = useDITBlogsContext();
  const { data: tags, error, isLoading } = (0, import_swr6.default)("tags", () => client.getTags());
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "text-center text-red-500", children: "Failed to load tags." });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "text-center text-muted-foreground", children: "Loading tags..." });
  }
  if (!tags || tags.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "text-center text-muted-foreground", children: "No tags found." });
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex flex-wrap items-center justify-center gap-4", children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "a",
    {
      href: `/tags/${tag.slug}`,
      className: "px-4 py-2 text-sm font-medium border rounded-full bg-card hover:bg-primary hover:text-primary-foreground transition-colors",
      children: [
        "#",
        tag.name
      ]
    },
    tag.slug
  )) });
}

// src/components/CategoriesListPage.tsx
var import_swr7 = __toESM(require("swr"));
var import_lucide_react5 = require("lucide-react");
var import_jsx_runtime11 = require("react/jsx-runtime");
function CategoriesListPage() {
  const { client } = useDITBlogsContext();
  const { data: categories, error, isLoading } = (0, import_swr7.default)("categories", () => client.getCategories());
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "text-center text-red-500", children: "Failed to load categories." });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [...Array(8)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "p-6 bg-muted rounded-lg animate-pulse h-24" }, i)) });
  }
  if (!categories || categories.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "text-center text-muted-foreground", children: "No categories found." });
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("a", { href: `/categories/${category.slug}`, className: "group flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-muted transition-colors", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react5.Tag, { className: "w-5 h-5 text-primary" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "font-semibold text-card-foreground group-hover:text-primary", children: category.name })
  ] }, category.slug)) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlogLayout,
  CategoriesListPage,
  CategoryPage,
  CommentSkeleton,
  CommentsSection,
  CommentsSectionSkeleton,
  DITBlogsProvider,
  Pagination,
  PostCardSkeleton,
  PostDetailsPage,
  PostDetailsSkeleton,
  PostsListPage,
  TagsListPage,
  darkTheme,
  lightTheme,
  useDITBlogsContext
});
