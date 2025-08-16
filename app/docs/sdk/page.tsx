"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Alert } from "@/components/docs/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SdkPage() {
  const quickStartCode = `import { DITBlogsClient } from '@dishistech/blogs-sdk';

// It's recommended to store your API key in environment variables
const client = new DITBlogsClient(process.env.DITBLOGS_API_KEY!);

async function fetchRecentPosts() {
  try {
    console.log('Fetching the 5 most recent posts...');
    const response = await client.getPosts({ limit: 5 });

    console.log(\`Found \${response.pagination.total} total posts.\`);
    response.posts.forEach(post => {
      console.log(\`- \${post.title} (slug: \${post.slug})\`);
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error.message);
  }
}

fetchRecentPosts();`;

  const errorHandlingCode = `async function fetchInvalidPost() {
  try {
    const post = await client.getPost('this-slug-does-not-exist');
    console.log(post);
  } catch (error) {
    // error.message will contain the JSON error response from the API
    console.error(error.message); 
    // Example output: API Error (404): "{\\"error\\":\\"Post not found.\\"}"
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        TypeScript SDK
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
        Official, lightweight, and type-safe TypeScript SDK for the DITBlogs API.
      </p>
      <Link href="https://www.npmjs.com/package/@dishistech/blogs-sdk" target="_blank" className="text-sm text-blue-600 hover:underline">
        View on NPM →
      </Link>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">Type-Safe</div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">Lightweight</div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">Promise-Based</div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">Isomorphic</div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Installation
      </h2>
      <Tabs defaultValue="npm">
        <TabsList>
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="yarn">yarn</TabsTrigger>
          <TabsTrigger value="pnpm">pnpm</TabsTrigger>
        </TabsList>
        <TabsContent value="npm">
          <CodeBlock code="npm install @dishistech/blogs-sdk" language="bash" />
        </TabsContent>
        <TabsContent value="yarn">
          <CodeBlock code="yarn add @dishistech/blogs-sdk" language="bash" />
        </TabsContent>
        <TabsContent value="pnpm">
          <CodeBlock code="pnpm add @dishistech/blogs-sdk" language="bash" />
        </TabsContent>
      </Tabs>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Quick Start
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Instantiate the client with your API key and start making requests.
      </p>
      <CodeBlock code={quickStartCode} language="typescript" />

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-16 mb-6 pt-8 border-t border-gray-200 dark:border-gray-700">
        API Reference
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-10">
        All methods return a Promise that resolves with data from the API.
      </p>

      {/* Client */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white"><code>new DITBlogsClient(apiKey)</code></h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Creates a new API client instance.</p>
        <ul className="list-none !p-0 mt-4 space-y-2">
          <li className="flex items-start gap-4 py-2">
            <code>apiKey</code> <Badge color="red">Required</Badge>
            <span>Your secret API key from the DITBlogs dashboard.</span>
          </li>
        </ul>
      </div>

      {/* Posts */}
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Posts</h3>
      <div className="space-y-8">
        <div>
          <h4 className="font-mono font-semibold">client.getPosts(params)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves a paginated list of posts.</p>
        </div>
        <div>
          <h4 className="font-mono font-semibold">client.getPost(slug)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves a single post by its slug.</p>
        </div>
      </div>
      
      {/* Categories */}
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Categories</h3>
      <div className="space-y-8">
        <div>
          <h4 className="font-mono font-semibold">client.getCategories()</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves a list of all categories.</p>
        </div>
        <div>
          <h4 className="font-mono font-semibold">client.getCategory(slug, params)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves a single category and its posts.</p>
        </div>
      </div>

      {/* Tags */}
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Tags</h3>
      <div className="space-y-8">
        <div>
          <h4 className="font-mono font-semibold">client.getTags()</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves a list of all tags.</p>
        </div>
        <div>
          <h4 className="font-mono font-semibold">client.getTag(slug, params)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves a single tag and its posts.</p>
        </div>
      </div>
      
      {/* Comments */}
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">Comments</h3>
      <div className="space-y-8">
        <div>
          <h4 className="font-mono font-semibold">client.getComments(postSlug)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Retrieves all comments for a post.</p>
        </div>
        <div>
          <h4 className="font-mono font-semibold">client.postComment(params)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Submits a new comment or a reply.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-16 mb-4 pt-8 border-t border-gray-200 dark:border-gray-700">
        Error Handling
      </h2>
      <Alert type="warning" title="Always Handle Errors">
        <p>If the API returns an error (any non-2xx status code), the promise will be rejected. You should wrap all API calls in a <code>try...catch</code> block to handle failures gracefully.</p>
      </Alert>
      <CodeBlock code={errorHandlingCode} language="typescript" />

    </motion.div>
  );
}