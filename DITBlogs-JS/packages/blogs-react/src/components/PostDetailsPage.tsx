// /packages/blogs-react/src/components/PostDetailsPage.tsx
"use client";

import React from 'react';
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider'; // Use renamed hook
import { PostDetailsSkeleton } from './skeletons';
import { CommentsSection } from './CommentsSection'; // We will create this next

interface PostDetailsPageProps {
  /** The slug of the post to display. */
  slug: string;
  /**
   * The auth token (e.g., JWT) for the logged-in user, required for posting comments.
   * This should be managed by your main application's authentication system.
   */
  userToken?: string;
}

export function PostDetailsPage({ slug, userToken }: PostDetailsPageProps) {
  const {client} = useDITBlogsContext();
  const { data: post, error, isLoading } = useSWR(['post', slug], () => client.getPost(slug));

  if (isLoading) return <PostDetailsSkeleton />;
  if (error) return <div className="text-center text-red-500 py-10">Error loading post. Please try again later.</div>;
  if (!post) return <div className="text-center text-muted-foreground py-10">404 | Post not found.</div>;

  return (
    <article>
      {/* Post Header */}
      <header className="mb-12 text-center">
        {post.category && (
            <a href={`/categories/${post.category.slug}`} className="text-primary font-semibold mb-2 block hover:underline">
                {post.category.name}
            </a>
        )}
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">{post.title}</h1>
        <div className="mt-6 text-muted-foreground">
          <span>By {post.author.name}</span> &middot; <span>Published on {new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
      </header>
      
      {/* Post Content */}
      <div
        className="prose dark:prose-invert lg:prose-xl mx-auto"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
      
      {/* Comments Section */}
      <section id="comments" className="max-w-3xl mx-auto mt-20">
        <h2 className="text-3xl font-bold mb-8 border-b pb-4 text-foreground">Discussion</h2>
        <CommentsSection postSlug={slug} userToken={userToken} />
      </section>
    </article>
  );
}