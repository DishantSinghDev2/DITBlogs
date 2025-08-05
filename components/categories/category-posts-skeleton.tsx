import { BlogPostsSkeleton } from "@/components/blog/blog-posts-skeleton"

export function CategoryPostsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogPostsSkeleton />
    </div>
  )
}
