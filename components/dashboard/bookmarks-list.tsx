"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, X } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

interface BookmarksListProps {
  bookmarks: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export function BookmarksList({ bookmarks, pagination }: BookmarksListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  async function handleRemoveBookmark(postId: string) {
    setIsLoading((prev) => ({ ...prev, [postId]: true }))

    try {
      const response = await fetch(`/api/bookmarks?postId=${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove bookmark")
      }

      toast({
        title: "Bookmark removed",
        description: "The post has been removed from your bookmarks.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [postId]: false }))
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bookmark className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No bookmarks yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">When you bookmark posts, they will appear here.</p>
        <Button asChild className="mt-4">
          <Link href="/blog">Browse Posts</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="overflow-hidden">
            {bookmark.post.featuredImage && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={bookmark.post.featuredImage || "/placeholder.svg"}
                  alt={bookmark.post.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="p-4">
              {bookmark.post.category && (
                <Badge variant="secondary" className="w-fit">
                  {bookmark.post.category.name}
                </Badge>
              )}
              <CardTitle className="line-clamp-2">
                <Link href={`/blog/${bookmark.post.slug}`} className="hover:underline">
                  {bookmark.post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="line-clamp-3 text-sm text-muted-foreground">{bookmark.post.excerpt}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={bookmark.post.author.image || ""} alt={bookmark.post.author.name} />
                  <AvatarFallback>
                    {bookmark.post.author.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <Link href={`/author/${bookmark.post.author.id}`} className="font-medium hover:underline">
                    {bookmark.post.author.name}
                  </Link>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveBookmark(bookmark.post.id)}
                disabled={isLoading[bookmark.post.id]}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove bookmark</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => router.push(`/dashboard/bookmarks?page=${page}`)}
        />
      )}
    </div>
  )
}
