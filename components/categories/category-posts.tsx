"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import { Pagination } from "@/components/ui/pagination"

interface CategoryPostsProps {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    createdAt: Date | null;
    author: {
      id: string;
      name: string;
      image: string | null;
    };
  }>
  totalPages: number
  currentPage: number
  categoryId: string
}

export function CategoryPosts({ posts, totalPages, currentPage, categoryId }: CategoryPostsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`?${params.toString()}`)
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No posts found</h3>
        <p className="text-muted-foreground mt-2">There are no posts in this category yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}
