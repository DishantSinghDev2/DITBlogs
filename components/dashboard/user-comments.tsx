"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"

interface UserCommentsProps {
  comments: Array<{
    id: string
    content: string
    createdAt: string
    post: {
      id: string
      title: string
      slug: string
    }
  }>
  totalPages: number
  currentPage: number
  userId: string
}

export function UserComments({ comments, totalPages, currentPage, userId }: UserCommentsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/dashboard/comments?${params.toString()}`)
  }

  const handleDeleteComment = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/comments?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      })

      // Refresh the current page
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-medium">No comments yet</h3>
        <p className="text-muted-foreground mt-2">You haven&apos;t made any comments yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              <Link href={`/blog/${comment.post.slug}`} className="hover:underline">
                {comment.post.title}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{comment.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={`/blog/${comment.post.slug}#comment-${comment.id}`} passHref>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your comment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}
