// /packages/blogs-react/src/components/TagsListPage.tsx
// NEW COMPONENT

"use client";

import useSWR from 'swr';
import { useDITBlogsContext } from '../provider';
import { Tag } from '@dishistech/blogs-sdk';

export function TagsListPage() {
  const {client} = useDITBlogsContext();
  const { data: tags, error, isLoading } = useSWR('tags', () => client.getTags());

  if (error) return <div className="text-center text-red-500">Failed to load tags.</div>;
  
  if (isLoading) {
      return <div className="text-center text-muted-foreground">Loading tags...</div>
  }
  
  if (!tags || tags.length === 0) return <div className="text-center text-muted-foreground">No tags found.</div>;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {tags.map((tag: Tag) => (
        <a 
          key={tag.slug} 
          href={`/tags/${tag.slug}`} 
          className="px-4 py-2 text-sm font-medium border rounded-full bg-card hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          #{tag.name}
        </a>
      ))}
    </div>
  );
}