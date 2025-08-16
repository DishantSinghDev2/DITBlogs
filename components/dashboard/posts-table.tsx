"use client"

import { useTransition, useState, useOptimistic } from "react" // Import useTransition
import { usePathname, useRouter, useSearchParams } from "next/navigation" // Import navigation hooks
import Link from "next/link"
import { format } from "date-fns"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, FileSignature, EyeIcon, Search, Loader2 } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isTransitioning, startTransition] = useTransition(); // <-- Add useTransition
  const [isMutating, setIsMutating] = useState(false); // For actions like delete/publish

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<{ id: string, type: 'post' | 'draft' } | null>(null);

  // This function handles all URL updates (tabs, search, pagination)
  const handleUrlUpdate = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change, but not when changing pages
    if (key !== 'page') {
      params.set('page', '1');
    }

    startTransition(() => {
      // router.push triggers the server component to re-fetch with new params
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;
    setIsMutating(true);

    const apiPath = contentToDelete.type === 'post'
      ? `/api/posts/${contentToDelete.id}`
      : `/api/drafts/${contentToDelete.id}`;

    try {
      const response = await fetch(apiPath, { method: "DELETE" });
      if (!response.ok) throw new Error(`Failed to delete ${contentToDelete.type}`);
      toast({ title: `${contentToDelete.type.charAt(0).toUpperCase() + contentToDelete.type.slice(1)} Deleted` });
      // Use startTransition for router.refresh() as well for smoother UI updates
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsMutating(false);
      setIsDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const handlePublishToggle = async (item: any) => {
    setIsMutating(true);
    const isPublished = currentStatus === 'published';
    const action = isPublished ? 'unpublish' : 'publish';
    const apiPath = `/api/posts/${item.id}/${action}`;

    try {
      const response = await fetch(apiPath, { method: "POST" });
      if (!response.ok) throw new Error(`Failed to ${action} post.`);
      toast({
        title: `Post ${isPublished ? 'Unpublished' : 'Published'}`,
        description: `The post has been moved to ${isPublished ? 'drafts' : 'published posts'}.`
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };
  
  const isLoading = isTransitioning || isMutating;

  return (
    <div className="space-y-4">
      <Tabs value={currentStatus} onValueChange={(value) => handleUrlUpdate('status', value)}>
        <TabsList>
          <TabsTrigger value="published"><Eye className="mr-2 h-4 w-4" />Published</TabsTrigger>
          <TabsTrigger value="draft"><FileSignature className="mr-2 h-4 w-4" />Drafts</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            defaultValue={query || ""}
            onChange={(e) => handleUrlUpdate('query', e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Main content area with loading overlay */}
      <div className="relative">
        {/* Loading Spinner Overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className={`rounded-md border transition-opacity ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
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
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" disabled={isLoading}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {currentStatus === 'published' && (
                            <DropdownMenuItem asChild><Link href={`/blog/${item.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View Live</Link></DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild><Link href={`/dashboard/editor/${item.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handlePublishToggle(item)} disabled={isLoading}>
                            {currentStatus === 'published' ? <EyeOff className="mr-2 h-4 w-4" /> : <EyeIcon className="mr-2 h-4 w-4" />}
                            {currentStatus === 'published' ? 'Unpublish' : 'Publish'}
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
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => handleUrlUpdate('page', page.toString())}
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
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isMutating}>
              {isMutating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}