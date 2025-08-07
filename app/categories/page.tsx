import { Suspense } from "react"
import type { Metadata } from "next"

import { CategoriesList } from "@/components/categories/categories-list"
import { CategoriesListSkeleton } from "@/components/categories/categories-list-skeleton"
import { getAllCategories } from "@/lib/api/categories"

export async function generateMetadata(): Promise<Metadata> {

  return {
    title: `Categories`,
    description: "Browse all content categories on our platform",
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const categories = await getAllCategories(page)

    console.log("categories", categories)

  return (
    <div className="container py-8">
      <Suspense fallback={<CategoriesListSkeleton />}>
        {categories.length > 0 ? <CategoriesList currentPage={page} categories={categories} totalPages={categories.length / 10} /> : (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No categories found.</p>
            </div>
        )}
      </Suspense>
    </div>
  )
}
