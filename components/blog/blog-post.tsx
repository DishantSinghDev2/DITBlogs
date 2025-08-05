"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Bookmark, Share2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import "./blog-post.scss"


interface BlogPostProps {
  post: any
  userId?: string
}

export function BlogPost({ post, userId }: BlogPostProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarks.some((bookmark: any) => bookmark.userId === userId) || false)
  const [isBookmarking, setIsBookmarking] = useState(false)


  const handleBookmark = async () => {
    if (!userId) {
      router.push(`/auth/login?callbackUrl=/blog/${post.slug}`)
      return
    }

    setIsBookmarking(true)

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?postId=${post.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to remove bookmark")
        }

        setIsBookmarked(false)
        toast({
          title: "Bookmark removed",
          description: "This post has been removed from your bookmarks.",
        })
      } else {
        // Add bookmark
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: post.id }),
        })

        if (!response.ok) {
          throw new Error("Failed to add bookmark")
        }

        setIsBookmarked(true)
        toast({
          title: "Bookmark added",
          description: "This post has been added to your bookmarks.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBookmarking(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying the URL
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "The link to this post has been copied to your clipboard.",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Category and tags */}
      <div className="flex flex-wrap items-center gap-2">
        {post.category && (
          <Link href={`/blog?category=${post.category.slug}`}>
            <Badge variant="secondary" className="hover:bg-secondary/80">
              {post.category.name}
            </Badge>
          </Link>
        )}
        {post.tags &&
          post.tags.map((tag: any) => (
            <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
              <Badge variant="outline" className="hover:bg-muted">
                {tag.name}
              </Badge>
            </Link>
          ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{post.title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div>
          By{" "}
          <Link href={`/author/${post.author.id}`} className="font-medium text-foreground hover:underline">
            {post.author.name}
          </Link>
        </div>
        <div>{format(new Date(post.publishedAt || post.createdAt), "MMMM d, yyyy")}</div>
        <div className="flex items-center">
          <Eye className="mr-1 h-4 w-4" />
          {post._count.views} views
        </div>
      </div>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="overflow-hidden rounded-lg">
          <img
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            className="h-auto w-full object-cover"
            width={1200}
            height={630}
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert tiptap" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleBookmark}
            disabled={isBookmarking}
          >
            <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
