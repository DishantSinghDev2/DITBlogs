import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { AuthorProfile } from "@/components/author/author-profile"
import { AuthorPosts } from "@/components/author/author-posts"
import { AuthorPostsSkeleton } from "@/components/author/author-posts-skeleton"
import { getAuthorById, getAuthorPosts } from "@/lib/api/authors"

interface AuthorPageProps {
  params: {
    id: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  try {
    const author = await getAuthorById(params.id)

    return {
      title: `${author.name} - InkPress`,
      description: author.bio || `Articles written by ${author.name}`,
    }
  } catch (error) {
    return {
      title: "Author - InkPress",
      description: "Author profile page",
    }
  }
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1

  try {
    const author = await getAuthorById(params.id)
    const postsData = await getAuthorPosts(params.id, page)

    return (
      <div className="container py-8 md:py-12">
        <AuthorProfile author={author} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Articles by {author.name}</h2>
          <Suspense fallback={<AuthorPostsSkeleton />}>
            <AuthorPosts
              posts={postsData.posts}
              totalPages={postsData.totalPages}
              currentPage={postsData.currentPage}
              authorId={params.id}
            />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
