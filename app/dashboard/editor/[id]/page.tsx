// app/dashboard/editor/[id]/page.tsx
"use client";

import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { BlogEditor } from "@/components/editor/blog-editor";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

// Define the Post type
interface Post {
    title: string;
    content: string;
    slug: string;
    id?: string;
    excerpt?: string;
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
}


const getPostData = async (postId: string): Promise<Post | null> => {
    const url = `/api/posts/${postId}`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        const post: Post = await response.json();
        return post;

    } catch (error) {
        console.error(`Error fetching post with ID ${postId}:`, error);
        return null;
    }
}


const Content = () => {
    const params = useParams<{ id: string }>();
    const { id } = params;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                setLoading(true);
                const data = await getPostData(id);
                setPost(data);
                setLoading(false);
            };

            fetchPost();
        }
    }, [id]);

    if (loading) {
        return (
            <DashboardShell>
                <DashboardHeader heading="Edit Post" text="Edit and update your blog post." />
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <Loader className="animate-spin h-6 w-6 text-gray-500" />
                </div>
            </DashboardShell>
        );
    }

    if (!post) {
        return (
            <DashboardShell>
                <DashboardHeader heading="Edit Post" text="Edit and update your blog post." />
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>Post not found</p>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Edit Post" text="Edit and update your blog post." />
            <BlogEditor post={post} />
        </DashboardShell>
    );
}

export default Content;