import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, MessageSquare } from "lucide-react"

interface RecentPostsProps {
  posts: any[]
}

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
        <CardDescription>Your recently published posts and their performance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't published any posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <Link href={`/dashboard/editor/${post.id}`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>•</span>
                    {post.category && <Badge variant="outline">{post.category.name}</Badge>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{post._count.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{post._count.comments}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
