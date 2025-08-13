
"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { useDITBlogsContext } from '../provider';
import { PostsListPage } from './PostsListPage';
import { PostCardSkeleton } from './skeletons';
import { Pagination } from './Pagination'; // Import Pagination
import { PostCard } from './PostCard';
import { Post } from '@dishistech/blogs-sdk';

export function CategoryPage({ slug }: { slug: string }) {
    const {client} = useDITBlogsContext();
    const [currentPage, setCurrentPage] = useState(1);
    
    // This SWR hook now also depends on currentPage
    const { data, error, isLoading } = useSWR(['category', slug, currentPage], () => client.getCategory(slug, { page: currentPage }));
    
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    if (error) return <div className="text-red-500 text-center">Failed to load category information.</div>;

    const categoryInfo = data?.category;

    return (
        <div>
            <header className="mb-12 text-center">
                {isLoading && !categoryInfo ? (
                    <div className="h-10 w-1/3 bg-muted rounded mx-auto animate-pulse"></div>
                ) : (
                    <h1 className="text-4xl font-extrabold text-foreground">Category: {categoryInfo?.name}</h1>
                )}
                {categoryInfo?.description && <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{categoryInfo.description}</p>}
            </header>
            
            {/* Conditional rendering for posts list */}
            {isLoading ? (
                 <div className="grid md:grid-cols-2 gap-8"><PostCardSkeleton /><PostCardSkeleton /></div>
            ) : data && data.posts.length > 0 ? (
                <div>
                  {/* Since PostsListPage is now complex, we just repeat its internal logic */}
                   <div className="grid md:grid-cols-2 gap-8">
                     {data.posts.map((post: Post) => <PostCard key={post.slug} post={post} />)}
                   </div>
                   <Pagination
                     currentPage={data.pagination.page}
                     totalPages={data.pagination.pages}
                     onPageChange={handlePageChange}
                   />
                </div>
            ) : (
                <div className="text-center text-muted-foreground mt-16">No posts found in this category.</div>
            )}
        </div>
    );
}