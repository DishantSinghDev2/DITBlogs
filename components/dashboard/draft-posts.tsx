import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PenTool } from "lucide-react"

interface DraftPostsProps {
  posts: any[]
}

export function DraftPosts({ posts }: DraftPostsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Draft Posts</CardTitle>
          <CardDescription>Continue working on your unpublished posts.</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/editor">
            <PenTool className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">You don't have any draft posts.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <Link href={`/dashboard/editor/${post.id}`} className="font-medium hover:underline">
                    {post.title || "Untitled Post"}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      Updated{" "}
                      {formatDistanceToNow(new Date(post.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {post.category && (
                      <>
                        <span>•</span>
                        <Badge variant="outline">{post.category.name}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="ml-auto flex-shrink-0">
                  <Link href={`/dashboard/editor/${post.id}`}>Edit</Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
