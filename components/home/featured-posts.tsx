import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface FeaturedPostsProps {
  posts: any[]
  config: {
    title: string
    showAuthor: boolean
    showDate: boolean
    maxPosts: number
  }
}

export function FeaturedPosts({ posts, config }: FeaturedPostsProps) {
  const displayPosts = posts.slice(0, config.maxPosts)

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tighter">{config.title}</h2>
            <p className="text-gray-500 dark:text-gray-400">Discover our most popular content</p>
          </div>
          <Link
            href="/blog"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            View All
          </Link>
        </div>
        <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              {post.featuredImage && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={post.featuredImage || "/placeholder.svg"}
                    alt={post.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
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
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                {config.showAuthor && post.author && (
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
                )}
                {config.showDate && (
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
