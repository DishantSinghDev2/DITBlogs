// src/provider.tsx
import { DITBlogsClient } from "@dishistech/blogs-sdk";
import { createContext, useContext, useMemo, useEffect } from "react";
import { SWRConfig } from "swr";

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
import { jsx } from "react/jsx-runtime";
var DITBlogsContext = createContext(null);
function useDITBlogsContext() {
  const context = useContext(DITBlogsContext);
  if (!context) throw new Error("useDITBlogsContext must be used within a DITBlogsProvider");
  return context;
}
function DITBlogsProvider({ children, apiKey, theme = "light", linkComponent = "a" }) {
  const client = useMemo(() => new DITBlogsClient(apiKey), [apiKey]);
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(DITBlogsContext.Provider, { value, children: /* @__PURE__ */ jsx(SWRConfig, { children }) });
}

// src/layout/BlogLayout.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function Header({ navLinks }) {
  const { Link } = useDITBlogsContext();
  return /* @__PURE__ */ jsx2("header", { className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur", children: /* @__PURE__ */ jsxs("nav", { className: "container mx-auto px-6 h-16 flex items-center justify-between", children: [
    /* @__PURE__ */ jsx2(Link, { href: "/", className: "text-2xl font-bold text-foreground", children: "My Blog" }),
    /* @__PURE__ */ jsx2("div", { className: "flex items-center gap-6", children: navLinks?.map((link) => /* @__PURE__ */ jsx2(Link, { href: link.href, className: "text-sm font-medium text-muted-foreground hover:text-foreground", children: link.label }, link.href)) })
  ] }) });
}
function Footer() {
  return /* @__PURE__ */ jsx2("footer", { className: "border-t mt-16", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-8 text-center text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxs("p", { children: [
      "\xA9 ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " My Company, Inc. All Rights Reserved."
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
      "Powered by ",
      /* @__PURE__ */ jsx2("a", { href: "https://blogs.dishis.tech", target: "_blank", rel: "noopener noreferrer", className: "font-semibold text-primary hover:underline", children: "blogs.dishis.tech" })
    ] })
  ] }) });
}
function BlogLayout({ children, apiKey, theme, navLinks, linkComponent }) {
  return /* @__PURE__ */ jsx2(DITBlogsProvider, { apiKey, theme, linkComponent, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx2(Header, { navLinks }),
    /* @__PURE__ */ jsx2("main", { className: "flex-grow container mx-auto px-6 py-12", children }),
    /* @__PURE__ */ jsx2(Footer, {})
  ] }) });
}

// src/components/PostsListPage.tsx
import { useState, useEffect as useEffect2 } from "react";
import useSWR from "swr";
import { ArrowRight, Search as SearchIcon } from "lucide-react";

// src/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs2("nav", { className: "flex items-center justify-between mt-12", "aria-label": "Pagination", children: [
    /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: handlePrevious,
        disabled: currentPage === 1,
        className: "px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsx3(ChevronLeft, { size: 16 }),
          "Previous"
        ]
      }
    ),
    /* @__PURE__ */ jsxs2("span", { className: "text-sm text-muted-foreground", children: [
      "Page ",
      currentPage,
      " of ",
      totalPages
    ] }),
    /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: handleNext,
        disabled: currentPage === totalPages,
        className: "px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2",
        children: [
          "Next",
          /* @__PURE__ */ jsx3(ChevronRight, { size: 16 })
        ]
      }
    )
  ] });
}

// src/components/skeletons.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function PostDetailsSkeleton() {
  return /* @__PURE__ */ jsxs3("div", { className: "animate-pulse", children: [
    /* @__PURE__ */ jsxs3("div", { className: "max-w-2xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-1/4 bg-muted rounded mx-auto mb-4" }),
      /* @__PURE__ */ jsx4("div", { className: "h-12 w-full bg-muted rounded mx-auto mb-6" }),
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-1/3 bg-muted rounded mx-auto" })
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "prose dark:prose-invert lg:prose-xl mx-auto mt-12", children: /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-full bg-muted rounded" }),
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-full bg-muted rounded" }),
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-11/12 bg-muted rounded" }),
      /* @__PURE__ */ jsx4("br", {}),
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-full bg-muted rounded" }),
      /* @__PURE__ */ jsx4("div", { className: "h-6 w-10/12 bg-muted rounded" })
    ] }) })
  ] });
}
function CommentSkeleton() {
  return /* @__PURE__ */ jsxs3("div", { className: "flex items-start space-x-4 py-4 animate-pulse", children: [
    /* @__PURE__ */ jsx4("div", { className: "w-10 h-10 rounded-full bg-muted shrink-0" }),
    /* @__PURE__ */ jsxs3("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsx4("div", { className: "h-4 w-1/4 bg-muted rounded" }),
      /* @__PURE__ */ jsx4("div", { className: "h-4 w-full bg-muted rounded" }),
      /* @__PURE__ */ jsx4("div", { className: "h-4 w-3/4 bg-muted rounded" })
    ] })
  ] });
}
function PostCardSkeleton() {
  return /* @__PURE__ */ jsxs3("div", { className: "p-6 border rounded-lg animate-pulse bg-card border-muted", children: [
    /* @__PURE__ */ jsx4("div", { className: "h-8 w-3/4 bg-muted rounded mb-4" }),
    /* @__PURE__ */ jsx4("div", { className: "h-4 w-full bg-muted rounded mb-2" }),
    /* @__PURE__ */ jsx4("div", { className: "h-4 w-5/6 bg-muted rounded mb-4" }),
    /* @__PURE__ */ jsx4("div", { className: "h-4 w-1/4 bg-muted rounded" })
  ] });
}
function CommentsSectionSkeleton() {
  return /* @__PURE__ */ jsxs3("div", { className: "mt-8", children: [
    /* @__PURE__ */ jsx4(CommentSkeleton, {}),
    /* @__PURE__ */ jsx4("div", { className: "pl-14 border-l-2 border-muted ml-5", children: /* @__PURE__ */ jsx4(CommentSkeleton, {}) }),
    /* @__PURE__ */ jsx4(CommentSkeleton, {})
  ] });
}

// src/components/PostsListPage.tsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function PostCard({ post }) {
  return /* @__PURE__ */ jsxs4("a", { href: `/posts/${post.slug}`, className: "block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted", children: [
    /* @__PURE__ */ jsx5("h3", { className: "text-2xl font-bold text-primary", children: post.title }),
    /* @__PURE__ */ jsx5("p", { className: "text-muted-foreground mt-2", children: post.excerpt }),
    /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between mt-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxs4("span", { children: [
        "By ",
        post.author.name,
        " \xB7 ",
        new Date(post.publishedAt).toLocaleDateString()
      ] }),
      /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-2 text-primary font-semibold", children: [
        "Read More ",
        /* @__PURE__ */ jsx5(ArrowRight, { size: 16 })
      ] })
    ] })
  ] });
}
function PostsListPage({ category, tag }) {
  const { client } = useDITBlogsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    ["posts", category, tag, currentPage],
    () => client.getPosts({ category, tag, page: currentPage })
  );
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };
  if (error) return /* @__PURE__ */ jsx5("div", { className: "text-center text-red-500", children: "Failed to load posts." });
  if (isLoading) {
    return /* @__PURE__ */ jsx5("div", { className: "grid md:grid-cols-2 gap-8", children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx5(PostCardSkeleton, {}, i)) });
  }
  if (!data || data.posts.length === 0) return /* @__PURE__ */ jsx5("div", { className: "text-center text-muted-foreground mt-16", children: "No posts found." });
  return /* @__PURE__ */ jsxs4("div", { children: [
    /* @__PURE__ */ jsx5("div", { className: "grid md:grid-cols-2 gap-8", children: data.posts.map((post) => /* @__PURE__ */ jsx5(PostCard, { post }, post.slug)) }),
    /* @__PURE__ */ jsx5(
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
import useSWR3 from "swr";

// src/components/CommentsSection.tsx
import { useState as useState2 } from "react";
import useSWR2, { useSWRConfig } from "swr";
import { CornerDownRight, Send } from "lucide-react";
import { Fragment, jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function CommentForm({ postSlug, userToken, parentId, onCommentPosted }) {
  const { client } = useDITBlogsContext();
  const { mutate } = useSWRConfig();
  const [content, setContent] = useState2("");
  const [error, setError] = useState2(null);
  const [isSubmitting, setIsSubmitting] = useState2(false);
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
  return /* @__PURE__ */ jsxs5("form", { onSubmit: handleSubmit, className: "mt-4", children: [
    /* @__PURE__ */ jsx6(
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
    userToken ? /* @__PURE__ */ jsx6("button", { type: "submit", disabled: isSubmitting || !content.trim(), className: "mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 flex items-center gap-2", children: isSubmitting ? "Posting..." : /* @__PURE__ */ jsxs5(Fragment, { children: [
      /* @__PURE__ */ jsx6(Send, { size: 16 }),
      parentId ? "Post Reply" : "Post Comment"
    ] }) }) : /* @__PURE__ */ jsx6("p", { className: "text-sm text-muted-foreground mt-2", children: "Please sign in to post a comment." }),
    error && /* @__PURE__ */ jsx6("p", { className: "text-sm text-red-500 mt-1", children: error })
  ] });
}
function CommentItem({ comment, postSlug, userToken }) {
  const [isReplying, setIsReplying] = useState2(false);
  return /* @__PURE__ */ jsxs5("div", { className: "flex items-start space-x-4 py-4", children: [
    /* @__PURE__ */ jsx6("img", { src: `https://ui-avatars.com/api/?name=${comment.user.name}&background=random`, alt: comment.user.name || "", className: "w-10 h-10 rounded-full shrink-0" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx6("span", { className: "font-bold text-foreground", children: comment.user.name }),
        /* @__PURE__ */ jsx6("time", { className: "text-xs text-muted-foreground", children: new Date(comment.createdAt).toLocaleString() })
      ] }),
      /* @__PURE__ */ jsx6("p", { className: "mt-1 text-foreground", children: comment.content }),
      /* @__PURE__ */ jsxs5("button", { onClick: () => setIsReplying(!isReplying), className: "mt-2 text-sm font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsx6(CornerDownRight, { size: 14 }),
        " Reply"
      ] }),
      isReplying && /* @__PURE__ */ jsx6(CommentForm, { postSlug, parentId: comment.id, userToken, onCommentPosted: () => setIsReplying(false) }),
      comment.replies?.length > 0 && /* @__PURE__ */ jsx6("div", { className: "mt-4 pl-6 border-l-2 border-muted", children: comment.replies.map((reply) => /* @__PURE__ */ jsx6(CommentItem, { comment: reply, postSlug, userToken }, reply.id)) })
    ] })
  ] });
}
function CommentsSection({ postSlug, userToken }) {
  const { client } = useDITBlogsContext();
  const { data: comments, error, isLoading } = useSWR2(["comments", postSlug], () => client.getComments(postSlug));
  if (isLoading) return /* @__PURE__ */ jsx6(CommentsSectionSkeleton, {});
  if (error) return /* @__PURE__ */ jsx6("div", { className: "text-red-500 text-center py-4", children: "Could not load comments." });
  return /* @__PURE__ */ jsxs5("div", { children: [
    /* @__PURE__ */ jsxs5("h3", { className: "text-xl font-bold mb-4", children: [
      comments?.length || 0,
      " Comments"
    ] }),
    /* @__PURE__ */ jsx6(CommentForm, { postSlug, userToken, onCommentPosted: () => {
    } }),
    /* @__PURE__ */ jsx6("div", { className: "mt-8 divide-y divide-muted", children: comments && comments.length > 0 ? comments.map((comment) => /* @__PURE__ */ jsx6(CommentItem, { comment, postSlug, userToken }, comment.id)) : /* @__PURE__ */ jsx6("p", { className: "text-center text-muted-foreground py-8", children: "No comments yet. Be the first to start the discussion!" }) })
  ] });
}

// src/components/PostDetailsPage.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function PostDetailsPage({ slug, userToken }) {
  const { client } = useDITBlogsContext();
  const { data: post, error, isLoading } = useSWR3(["post", slug], () => client.getPost(slug));
  if (isLoading) return /* @__PURE__ */ jsx7(PostDetailsSkeleton, {});
  if (error) return /* @__PURE__ */ jsx7("div", { className: "text-center text-red-500 py-10", children: "Error loading post. Please try again later." });
  if (!post) return /* @__PURE__ */ jsx7("div", { className: "text-center text-muted-foreground py-10", children: "404 | Post not found." });
  return /* @__PURE__ */ jsxs6("article", { children: [
    /* @__PURE__ */ jsxs6("header", { className: "mb-12 text-center", children: [
      post.category && /* @__PURE__ */ jsx7("a", { href: `/categories/${post.category.slug}`, className: "text-primary font-semibold mb-2 block hover:underline", children: post.category.name }),
      /* @__PURE__ */ jsx7("h1", { className: "text-4xl md:text-6xl font-extrabold text-foreground tracking-tight", children: post.title }),
      /* @__PURE__ */ jsxs6("div", { className: "mt-6 text-muted-foreground", children: [
        /* @__PURE__ */ jsxs6("span", { children: [
          "By ",
          post.author.name
        ] }),
        " \xB7 ",
        /* @__PURE__ */ jsxs6("span", { children: [
          "Published on ",
          new Date(post.publishedAt).toLocaleDateString()
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx7(
      "div",
      {
        className: "prose dark:prose-invert lg:prose-xl mx-auto",
        dangerouslySetInnerHTML: { __html: post.content || "" }
      }
    ),
    /* @__PURE__ */ jsxs6("section", { id: "comments", className: "max-w-3xl mx-auto mt-20", children: [
      /* @__PURE__ */ jsx7("h2", { className: "text-3xl font-bold mb-8 border-b pb-4 text-foreground", children: "Discussion" }),
      /* @__PURE__ */ jsx7(CommentsSection, { postSlug: slug, userToken })
    ] })
  ] });
}

// src/components/CategoryPage.tsx
import { useState as useState3 } from "react";
import useSWR4 from "swr";

// src/components/PostCard.tsx
import { ArrowRight as ArrowRight2 } from "lucide-react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function PostCard2({ post }) {
  const { Link } = useDITBlogsContext();
  return /* @__PURE__ */ jsxs7(Link, { href: `/posts/${post.slug}`, className: "block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted", children: [
    /* @__PURE__ */ jsx8("h3", { className: "text-2xl font-bold text-primary", children: post.title }),
    /* @__PURE__ */ jsx8("p", { className: "text-muted-foreground mt-2", children: post.excerpt }),
    /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between mt-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxs7("span", { children: [
        "By ",
        post.author.name,
        " \xB7 ",
        new Date(post.publishedAt).toLocaleDateString()
      ] }),
      /* @__PURE__ */ jsxs7("span", { className: "flex items-center gap-2 text-primary font-semibold", children: [
        "Read More ",
        /* @__PURE__ */ jsx8(ArrowRight2, { size: 16 })
      ] })
    ] })
  ] });
}

// src/components/CategoryPage.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function CategoryPage({ slug }) {
  const { client } = useDITBlogsContext();
  const [currentPage, setCurrentPage] = useState3(1);
  const { data, error, isLoading } = useSWR4(["category", slug, currentPage], () => client.getCategory(slug, { page: currentPage }));
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };
  if (error) return /* @__PURE__ */ jsx9("div", { className: "text-red-500 text-center", children: "Failed to load category information." });
  const categoryInfo = data?.category;
  return /* @__PURE__ */ jsxs8("div", { children: [
    /* @__PURE__ */ jsxs8("header", { className: "mb-12 text-center", children: [
      isLoading && !categoryInfo ? /* @__PURE__ */ jsx9("div", { className: "h-10 w-1/3 bg-muted rounded mx-auto animate-pulse" }) : /* @__PURE__ */ jsxs8("h1", { className: "text-4xl font-extrabold text-foreground", children: [
        "Category: ",
        categoryInfo?.name
      ] }),
      categoryInfo?.description && /* @__PURE__ */ jsx9("p", { className: "mt-4 text-lg text-muted-foreground max-w-2xl mx-auto", children: categoryInfo.description })
    ] }),
    isLoading ? /* @__PURE__ */ jsxs8("div", { className: "grid md:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsx9(PostCardSkeleton, {}),
      /* @__PURE__ */ jsx9(PostCardSkeleton, {})
    ] }) : data && data.posts.length > 0 ? /* @__PURE__ */ jsxs8("div", { children: [
      /* @__PURE__ */ jsx9("div", { className: "grid md:grid-cols-2 gap-8", children: data.posts.map((post) => /* @__PURE__ */ jsx9(PostCard2, { post }, post.slug)) }),
      /* @__PURE__ */ jsx9(
        Pagination,
        {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange
        }
      )
    ] }) : /* @__PURE__ */ jsx9("div", { className: "text-center text-muted-foreground mt-16", children: "No posts found in this category." })
  ] });
}

// src/components/TagsListPage.tsx
import useSWR5 from "swr";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function TagsListPage() {
  const { client } = useDITBlogsContext();
  const { data: tags, error, isLoading } = useSWR5("tags", () => client.getTags());
  if (error) return /* @__PURE__ */ jsx10("div", { className: "text-center text-red-500", children: "Failed to load tags." });
  if (isLoading) {
    return /* @__PURE__ */ jsx10("div", { className: "text-center text-muted-foreground", children: "Loading tags..." });
  }
  if (!tags || tags.length === 0) return /* @__PURE__ */ jsx10("div", { className: "text-center text-muted-foreground", children: "No tags found." });
  return /* @__PURE__ */ jsx10("div", { className: "flex flex-wrap items-center justify-center gap-4", children: tags.map((tag) => /* @__PURE__ */ jsxs9(
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
import useSWR6 from "swr";
import { Tag as CategoryIcon } from "lucide-react";
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
function CategoriesListPage() {
  const { client } = useDITBlogsContext();
  const { data: categories, error, isLoading } = useSWR6("categories", () => client.getCategories());
  if (error) return /* @__PURE__ */ jsx11("div", { className: "text-center text-red-500", children: "Failed to load categories." });
  if (isLoading) {
    return /* @__PURE__ */ jsx11("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [...Array(8)].map((_, i) => /* @__PURE__ */ jsx11("div", { className: "p-6 bg-muted rounded-lg animate-pulse h-24" }, i)) });
  }
  if (!categories || categories.length === 0) return /* @__PURE__ */ jsx11("div", { className: "text-center text-muted-foreground", children: "No categories found." });
  return /* @__PURE__ */ jsx11("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: categories.map((category) => /* @__PURE__ */ jsxs10("a", { href: `/categories/${category.slug}`, className: "group flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-muted transition-colors", children: [
    /* @__PURE__ */ jsx11(CategoryIcon, { className: "w-5 h-5 text-primary" }),
    /* @__PURE__ */ jsx11("span", { className: "font-semibold text-card-foreground group-hover:text-primary", children: category.name })
  ] }, category.slug)) });
}
export {
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
};
