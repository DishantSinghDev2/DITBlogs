import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug } from "@/lib/api/posts"
import { BlogPost } from "@/components/blog/blog-post"
import { BlogAuthor } from "@/components/blog/blog-author"
import { BlogComments } from "@/components/blog/blog-comments"
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { incrementPostView } from "@/lib/api/posts"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Increment view count
  await incrementPostView(post.id)

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

 

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="mx-auto max-w-4xl">
        <BlogPost post={post} userId={userId} />
        <hr className="my-8 border-border" />
        <BlogAuthor author={post.author} />
        <hr className="my-8 border-border" />
        <BlogComments postId={post.id} userId={userId} />
      </article>
      <div className="mx-auto mt-16 max-w-5xl">
        <BlogRelatedPosts postId={post.id} categoryId={post.categoryId} />
      </div>
    </main>
  )
}
