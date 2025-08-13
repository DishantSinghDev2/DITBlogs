// /packages/blogs-react/src/components/CategoriesListPage.tsx
// NEW COMPONENT

"use client";

import React from 'react';
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider';
import { Tag as CategoryIcon } from 'lucide-react'; // Using Tag icon for visual consistency
import { Category } from '@dishistech/blogs-sdk';

export function CategoriesListPage() {
  const {client} = useDITBlogsContext();
  const { data: categories, error, isLoading } = useSWR('categories', () => client.getCategories());

  if (error) return <div className="text-center text-red-500">Failed to load categories.</div>;
  
  // Skeleton state for categories
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-6 bg-muted rounded-lg animate-pulse h-24"></div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) return <div className="text-center text-muted-foreground">No categories found.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category: Category) => (
        <a key={category.slug} href={`/categories/${category.slug}`} className="group flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-muted transition-colors">
          <CategoryIcon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-card-foreground group-hover:text-primary">{category.name}</span>
        </a>
      ))}
    </div>
  );
}