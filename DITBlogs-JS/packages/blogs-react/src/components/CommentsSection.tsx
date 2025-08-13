// /packages/blogs-react/src/components/CommentsSection.tsx
"use client";

import React, { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useDITBlogsContext } from '../provider'; // Use renamed hook
import { Comment } from '@dishistech/blogs-sdk';
import { CommentsSectionSkeleton } from './skeletons';
import { CornerDownRight, Send } from 'lucide-react';

// --- Reusable Comment Form ---
function CommentForm({ postSlug, userToken, parentId, onCommentPosted }: { postSlug: string; userToken?: string; parentId?: string; onCommentPosted: () => void }) {
    const {client} = useDITBlogsContext();
    const { mutate } = useSWRConfig();
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !userToken) return;

        setIsSubmitting(true);
        setError(null);
        try {
            await client.postComment({ postSlug, content, parentId, userToken });
            setContent("");
            onCommentPosted(); // Callback to hide form, etc.
            mutate(['comments', postSlug]); // Revalidate comments after posting
        } catch (err: any) {
            setError(err.message || "Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? "Write your reply..." : "Join the discussion..."}
                className="w-full p-2 border rounded-md bg-muted focus:ring-2 focus:ring-primary outline-none"
                rows={3}
                disabled={isSubmitting || !userToken}
            />
            {userToken ? (
                 <button type="submit" disabled={isSubmitting || !content.trim()} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? "Posting..." : <><Send size={16} />{parentId ? "Post Reply" : "Post Comment"}</>}
                </button>
            ) : (
                <p className="text-sm text-muted-foreground mt-2">Please sign in to post a comment.</p>
            )}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </form>
    );
}

// --- Component to Render a Single Comment and its Replies ---
function CommentItem({ comment, postSlug, userToken }: { comment: Comment; postSlug: string; userToken?: string; }) {
    const [isReplying, setIsReplying] = useState(false);

    return (
        <div className="flex items-start space-x-4 py-4">
            <img src={`https://ui-avatars.com/api/?name=${comment.user.name}&background=random`} alt={comment.user.name || ''} className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{comment.user.name}</span>
                    <time className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</time>
                </div>
                <p className="mt-1 text-foreground">{comment.content}</p>
                <button onClick={() => setIsReplying(!isReplying)} className="mt-2 text-sm font-semibold text-primary flex items-center gap-1">
                    <CornerDownRight size={14} /> Reply
                </button>
                {isReplying && <CommentForm postSlug={postSlug} parentId={comment.id} userToken={userToken} onCommentPosted={() => setIsReplying(false)} />}
                {comment.replies?.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-muted">
                        {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} postSlug={postSlug} userToken={userToken} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- The Main Exported Component ---
export function CommentsSection({ postSlug, userToken }: { postSlug: string; userToken?: string }) {
  const {client} = useDITBlogsContext();
  const { data: comments, error, isLoading } = useSWR(['comments', postSlug], () => client.getComments(postSlug));

  if (isLoading) return <CommentsSectionSkeleton />;
  if (error) return <div className="text-red-500 text-center py-4">Could not load comments.</div>;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{comments?.length || 0} Comments</h3>
      <CommentForm postSlug={postSlug} userToken={userToken} onCommentPosted={() => {}} />
      <div className="mt-8 divide-y divide-muted">
        {comments && comments.length > 0 ? (
          comments.map((comment: Comment) => <CommentItem key={comment.id} comment={comment} postSlug={postSlug} userToken={userToken} />)
        ) : (
          <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to start the discussion!</p>
        )}
      </div>
    </div>
  );
}