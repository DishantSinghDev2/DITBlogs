import { Suspense } from "react"
import { BlogHeader } from "@/components/blog/blog-header"
import { BlogPosts } from "@/components/blog/blog-posts"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { BlogPostsSkeleton } from "@/components/blog/blog-posts-skeleton"
import { getAllCategories } from "@/lib/api/categories"

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; tag?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const category = searchParams.category
  const tag = searchParams.tag
  const search = searchParams.search

  const categories = await getAllCategories()

  return (
    <main className="container mx-auto px-4 py-8">
      <BlogHeader />
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3">
          <Suspense fallback={<BlogPostsSkeleton />}>
            <BlogPosts page={page} category={category} tag={tag} search={search} />
          </Suspense>
        </div>
        <div className="md:col-span-1">
          <BlogSidebar categories={categories} />
        </div>
      </div>
    </main>
  )
}
