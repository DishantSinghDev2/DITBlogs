import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthorsList } from "@/components/author/author-list"
import { AuthorsListSkeleton } from "@/components/author/authors-list-skeleton"
import { getAuthors } from "@/lib/api/authors"

export const metadata: Metadata = {
  title: "Authors - InkPress",
  description: "Meet our talented team of writers and content creators.",
}

interface AuthorsPageProps {
  searchParams: {
    page?: string
  }
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const authorsData = await getAuthors(page)

  return (
    <div className="container py-8 md:py-12">

      <Suspense fallback={<AuthorsListSkeleton />}>
        {authorsData.authors.length > 0 ? <AuthorsList
          authors={authorsData.authors}
          totalPages={authorsData.totalPages}
          currentPage={authorsData.currentPage}
        /> : (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No authors found.</p>
            </div>
        )}
      </Suspense>
    </div>
  )
}
