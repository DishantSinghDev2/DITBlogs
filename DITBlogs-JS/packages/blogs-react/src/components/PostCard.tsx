"use client";

import { Post } from "@dishistech/blogs-sdk";
import { useDITBlogsContext } from "../provider";
import { ArrowRight } from "lucide-react";

export function PostCard({ post }: { post: Post }) {
  const { Link } = useDITBlogsContext();
  return (
    <Link href={`/posts/${post.slug}`} className="block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card text-card-foreground border-muted">
      <h3 className="text-2xl font-bold text-primary">{post.title}</h3>
      <p className="text-muted-foreground mt-2">{post.excerpt}</p>
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>By {post.author.name} &middot; {new Date(post.publishedAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-2 text-primary font-semibold">Read More <ArrowRight size={16} /></span>
      </div>
    </Link>
  );
}