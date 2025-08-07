import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CategoryPosts } from "@/components/categories/category-posts"
import { CategoryPostsSkeleton } from "@/components/categories/category-posts-skeleton"
import { getCategoryBySlug } from "@/lib/api/categories"

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)
  

  if (!category) {
    return {
      title: `Category Not Found`,
    }
  }


  return {
    title: `${category.name}`,
    description: category.description || `Browse all posts in the ${category.name} category`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    
    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const category = await getCategoryBySlug(params.slug, page)
    if (!category ) {
        notFound()
    }

    console.log("category", category)
    

  return (
    <div className="container py-8">
      <Suspense fallback={<CategoryPostsSkeleton />}>
        <CategoryPosts categoryId={category.id} currentPage={page} posts={category.posts} totalPages={category.posts.length / 10} />
      </Suspense>
    </div>
  )
}
