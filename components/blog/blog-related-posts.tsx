import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRelatedPosts } from "@/lib/api/posts"

interface BlogRelatedPostsProps {
  postId: string
  categoryId?: string | null
}

export async function BlogRelatedPosts({ postId, categoryId }: BlogRelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(postId, categoryId)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Related Posts</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
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
              <CardTitle className="line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
