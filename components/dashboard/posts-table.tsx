"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, Star, StarOff } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

interface PostsTableProps {
  posts: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export function PostsTable({ posts, pagination }: PostsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDeletePost() {
    if (!postToDelete) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  async function handleTogglePublish(id: string, currentStatus: boolean) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          published: !currentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update post")
      }

      toast({
        title: currentStatus ? "Post unpublished" : "Post published",
        description: currentStatus ? "Your post has been unpublished." : "Your post has been published.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleFeatured(id: string, currentStatus: boolean) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          featured: !currentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update post")
      }

      toast({
        title: currentStatus ? "Post unfeatured" : "Post featured",
        description: currentStatus
          ? "Your post has been removed from featured posts."
          : "Your post has been added to featured posts.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No posts found. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    <div className="hidden text-sm text-muted-foreground md:hidden">
                      {post.category?.name || "Uncategorized"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.category ? (
                      <Badge variant="outline">{post.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
                    {post.featured && (
                      <Badge variant="secondary" className="ml-2">
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/editor/${post.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(post.id, post.published)}
                          disabled={isLoading}
                        >
                          {post.published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleFeatured(post.id, post.featured)}
                          disabled={isLoading}
                        >
                          {post.featured ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Unfeature
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Feature
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setPostToDelete(post.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-600"
                          disabled={isLoading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => router.push(`/dashboard/posts?page=${page}`)}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
