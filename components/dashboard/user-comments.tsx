"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, CornerUpRight, Trash2, Loader2, Pen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Update the props interface to match the new data
interface UserCommentsProps {
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    post: { title: string; slug: string };
    parent: { user: { name: string | null } } | null; // A comment can be a reply
  }>;
  totalPages: number;
  currentPage: number;
}

export function UserComments({ comments, totalPages, currentPage }: UserCommentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/comments?${params.toString()}`);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments?id=${commentToDelete}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete comment");
      toast({ title: "Comment Deleted", description: "Your comment has been removed." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setCommentToDelete(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 py-12 text-center">
        <Pen className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-xl font-medium">No Comments Yet</h3>
        <p className="mt-2 text-muted-foreground">Go on, join the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* --- Timeline Style List --- */}
      <div className="relative border-l-2 border-dashed border-border pl-6">
        {comments.map((comment, index) => (
          <div key={comment.id} className="relative mb-8">
            {/* The "dot" on the timeline */}
            <div className="absolute -left-[33px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {comment.parent ? (
                <CornerUpRight className="h-5 w-5" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
            </div>
            
            <div className="rounded-lg border bg-card p-4 shadow-sm">
                {/* Header with context */}
                <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {comment.parent ? (
                            <>Replied to <strong>{comment.parent.user.name || 'a user'}</strong> on:</>
                        ) : (
                            <>Commented on:</>
                        )}
                        <Link href={`/blog/${comment.post.slug}`} className="ml-1 font-medium text-primary hover:underline">
                            {comment.post.title}
                        </Link>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground sm:mt-0">
                       {format(new Date(comment.createdAt), "LLL dd, yyyy 'at' h:mm a")}
                    </p>
                </div>
                
                {/* The actual comment content */}
                <blockquote className="border-l-4 border-border pl-4 italic text-foreground">
                    {comment.content}
                </blockquote>
                
                {/* Actions */}
                <div className="mt-4 flex justify-end gap-2">
                     <Link href={`/blog/${comment.post.slug}#comment-${comment.id}`} passHref>
                        <Button variant="ghost" size="sm">View Context</Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => setCommentToDelete(comment.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your comment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}