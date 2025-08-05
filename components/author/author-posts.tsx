"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon, Clock, MessageSquare } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readingTime: number
  viewCount: number
  commentCount: number
  category: {
    id: string
    name: string
    slug: string
  }
}

interface AuthorPostsProps {
  posts: Post[]
  totalPages: number
  currentPage: number
  authorId: string
}

export function AuthorPosts({ posts, totalPages, currentPage, authorId }: AuthorPostsProps) {
  const router = useRouter()

  const handlePageChange = (page: number) => {
    router.push(`/author/${authorId}?page=${page}`)
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">This author hasn't published any posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden flex flex-col">
            {post.featuredImage && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="flex-none">
              {post.category && (
                <div className="flex flex-wrap gap-2 mb-2">
                    <Link
                      key={post.category.id}
                      href={`/category/${post.category.slug}`}
                      className="text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80"
                    >
                      {post.category.name}
                    </Link>
                </div>
              )}
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              {post.excerpt && <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>}
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(post.publishedAt || new Date())}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{post.commentCount}</span>
                </div>
              </div>
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
