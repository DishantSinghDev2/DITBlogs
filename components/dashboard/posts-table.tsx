"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, Star, StarOff, FileSignature, EyeIcon, Search } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input"

interface PostsTableProps {
  content: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  },
  currentStatus: 'published' | 'draft';
  query?: string;
}

export function PostsTable({ content, pagination, currentStatus, query }: PostsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<{ id: string, type: 'post' | 'draft' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query || "");


  // --- Handlers ---
  const handleTabChange = (value: string) => {
    router.push(`/dashboard/posts?status=${value}`);
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;
    setIsLoading(true);

    // The API endpoint depends on whether we are deleting a Post or a Draft
    const apiPath = contentToDelete.type === 'post'
      ? `/api/posts/${contentToDelete.id}`
      : `/api/drafts/${contentToDelete.id}`; // You'll need to create this simple DELETE endpoint

    try {
      const response = await fetch(apiPath, { method: "DELETE" });
      if (!response.ok) throw new Error(`Failed to delete ${contentToDelete.type}`);
      toast({ title: `${contentToDelete.type.charAt(0).toUpperCase() + contentToDelete.type.slice(1)} Deleted` });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const handleUnpublish = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/unpublish`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to unpublish post.");
      toast({ title: "Post Unpublished", description: "The post has been moved to your drafts." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }


  const handlePublish = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to Publish post.");
      toast({ title: "Post Published", description: "The post has been moved to your posts." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs value={currentStatus} onValueChange={handleTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="published"><Eye className="mr-2 h-4 w-4" />Published</TabsTrigger>
        <TabsTrigger value="draft"><FileSignature className="mr-2 h-4 w-4" />Drafts</TabsTrigger>
      </TabsList>

      <div
        className="flex items-center gap-2"
      >
        <Input
          placeholder="Search posts..."
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            params.set("query", e.target.value);
            router.push(`/dashboard/posts?${params.toString()}`);
          }}
          className="w-full md:w-[300px]"
        />
        <Button type="submit" size="sm">
          <Search className="h-4 w-4" />
        </Button>
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">{currentStatus === 'published' ? 'Published' : 'Last Updated'}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No {currentStatus} content found.</TableCell></TableRow>
            ) : (
              content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title || "Untitled"}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.category?.name || "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(item.publishedAt || item.updatedAt), 'LLL dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currentStatus === 'published' && (
                          <DropdownMenuItem asChild><Link href={`/blog/${item.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View Live</Link></DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild><Link href={`/dashboard/editor/${item.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>

                        <DropdownMenuItem onClick={() => {
                          if (currentStatus === "published") handleUnpublish(item.id); else handlePublish(item.id)
                        }} disabled={isLoading}>
                          {currentStatus === 'published' ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />Unpublish
                            </>
                          ) : (
                            <>
                              <EyeIcon className="mr-2 h-4 w-4" />Publish
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setIsDeleteDialogOpen(true)
                          setContentToDelete({ id: item.id, type: currentStatus === 'published' ? 'post' : 'draft' })
                        }} className="text-red-600" disabled={isLoading}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}
