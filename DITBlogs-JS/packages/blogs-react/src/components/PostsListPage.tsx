// /packages/blogs-react/src/components/PostsListPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { useDITBlogs } from "../provider";
import { PostCardSkeleton } from "./skeletons"; // Skeletons are crucial!
import { Post } from "@dishistech/blogs-sdk";
import { ArrowRight, Search as SearchIcon, X } from "lucide-react";
import { Pagination } from "./Pagination";

// Debounce hook for search input
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function SearchBar({ onSearchChange }: { onSearchChange: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-12">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for posts..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
      />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <a href={`/posts/${post.slug}`} className="block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted">
      <h3 className="text-2xl font-bold text-primary">{post.title}</h3>
      <p className="text-muted-foreground mt-2">{post.excerpt}</p>
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>By {post.author.name} &middot; {new Date(post.publishedAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-2 text-primary font-semibold">Read More <ArrowRight size={16} /></span>
      </div>
    </a>
  );
}

export function PostsListPage({ category, tag }: { category?: string; tag?: string }) {
  const client = useDITBlogs();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading } = useSWR(
    ["posts", category, tag, currentPage],
    () => client.getPosts({ category, tag, page: currentPage })
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  if (error) return <div className="text-center text-red-500">Failed to load posts.</div>;
  if (isLoading) {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
    );
  }
  if (!data || data.posts.length === 0) return <div className="text-center text-muted-foreground mt-16">No posts found.</div>;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8">
        {data.posts.map((post) => <PostCard key={post.slug} post={post} />)}
      </div>
      <Pagination
        currentPage={data.pagination.page}
        totalPages={data.pagination.pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}