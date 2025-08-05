"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Reply } from "lucide-react"

interface BlogCommentsProps {
  postId: string
  userId?: string
}

export function BlogComments({ postId, userId }: BlogCommentsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch comments on component mount
  useState(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${postId}`)
        if (!response.ok) throw new Error("Failed to fetch comments")
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  })

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      router.push(`/auth/login?callbackUrl=/blog/${postId}`)
      return
    }

    if (!commentText.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: commentText,
        }),
      })

      if (!response.ok) throw new Error("Failed to post comment")

      const newComment = await response.json()
      setComments([newComment, ...comments])
      setCommentText("")
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!userId) {
      router.push(`/auth/login?callbackUrl=/blog/${postId}`)
      return
    }

    const replyContent = replyText[parentId]
    if (!replyContent?.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: replyContent,
          parentId,
        }),
      })

      if (!response.ok) throw new Error("Failed to post reply")

      const newReply = await response.json()

      // Update the comments state with the new reply
      setComments(
        comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          return comment
        }),
      )

      setReplyText({ ...replyText, [parentId]: "" })
      setReplyingTo(null)
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Comments</h2>
        <div className="flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea
          placeholder={userId ? "Write a comment..." : "Sign in to comment"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!userId || isSubmitting}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!userId || !commentText.trim() || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No comments yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="rounded-lg border p-4">
                {/* Comment header */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
                    <AvatarFallback>
                      {comment.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{comment.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Comment content */}
                <div className="mt-2">{comment.content}</div>

                {/* Reply button */}
                {userId && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="mr-1 h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="ml-8 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText[comment.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText[comment.id]?.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-4">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id} className="rounded-lg border p-4">
                      {/* Reply header */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.user.image || ""} alt={reply.user.name} />
                          <AvatarFallback>
                            {reply.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{reply.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      {/* Reply content */}
                      <div className="mt-2">{reply.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
