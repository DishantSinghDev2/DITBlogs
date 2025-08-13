// /packages/blogs-react/src/components/skeletons.tsx

/** A detailed skeleton for the single post page before content has loaded. */
export function PostDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-2xl mx-auto text-center">
        <div className="h-6 w-1/4 bg-muted rounded mx-auto mb-4"></div>
        <div className="h-12 w-full bg-muted rounded mx-auto mb-6"></div>
        <div className="h-6 w-1/3 bg-muted rounded mx-auto"></div>
      </div>
      <div className="prose dark:prose-invert lg:prose-xl mx-auto mt-12">
        <div className="space-y-4">
          <div className="h-6 w-full bg-muted rounded"></div>
          <div className="h-6 w-full bg-muted rounded"></div>
          <div className="h-6 w-11/12 bg-muted rounded"></div>
          <br />
          <div className="h-6 w-full bg-muted rounded"></div>
          <div className="h-6 w-10/12 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

/** A skeleton for a single comment entry. */
export function CommentSkeleton() {
    return (
        <div className="flex items-start space-x-4 py-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
        </div>
    );
}

/** A skeleton for a single post card in a list. */
export function PostCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg animate-pulse bg-card border-muted">
      <div className="h-8 w-3/4 bg-muted rounded mb-4"></div>
      <div className="h-4 w-full bg-muted rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-muted rounded mb-4"></div>
      <div className="h-4 w-1/4 bg-muted rounded"></div>
    </div>
  );
}

/** A skeleton for the entire comments section container. */
export function CommentsSectionSkeleton() {
    return (
        <div className="mt-8">
            <CommentSkeleton />
            <div className="pl-14 border-l-2 border-muted ml-5">
                <CommentSkeleton />
            </div>
            <CommentSkeleton />
        </div>
    );
}