import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { getAllPosts } from "@/lib/api/posts"

interface BlogPostsProps {
  page: number
  category?: string
  tag?: string
  search?: string
}

export async function BlogPosts({ page, category, tag, search }: BlogPostsProps) {
  const { posts, pagination } = await getAllPosts({
    page,
    limit: 9,
    category,
    tag,
    search,
  })

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No posts found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {search
            ? `No posts matching "${search}"`
            : category
              ? `No posts in the "${category}" category`
              : tag
                ? `No posts with the "${tag}" tag`
                : "There are no posts yet"}
        </p>
        {search ? (<Button asChild className="mt-4">
          <Link href="/blog">View all posts</Link>
        </Button>) : null }
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Flex grid with varying post sizes */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post: any) => (
          <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            {post.featuredImage && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="p-4">
              {post.category && (
                <Badge variant="secondary" className="w-fit">
                  {post.category.name}
                </Badge>
              )}
              <CardTitle className="line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image || ""} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <Link href={`/author/${post.author.id}`} className="font-medium hover:underline">
                    {post.author.name}
                  </Link>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => {
              const url = new URL(window.location.href)
              url.searchParams.set("page", page.toString())
              window.location.href = url.toString()
            }}
          />
        </div>
      )}
    </div>
  )
}
