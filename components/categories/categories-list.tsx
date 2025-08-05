"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"

interface CategoriesListProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    postCount: number
  }>
  totalPages: number
  currentPage: number
}

export function CategoriesList({ categories, totalPages, currentPage }: CategoriesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/categories?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">{category.name}</CardTitle>
              {category.description && <CardDescription>{category.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {category.postCount} {category.postCount === 1 ? "post" : "posts"}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/categories/${category.slug}`} passHref>
                <Button variant="outline" className="w-full">
                  View Category
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}
