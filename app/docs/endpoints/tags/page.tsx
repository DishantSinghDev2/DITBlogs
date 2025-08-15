"use client";
import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Endpoint } from "@/components/docs/Endpoint";
import { motion } from "framer-motion";

export default function TagsEndpointPage() {
  const getAllTagsResponse = `[
  {
    "name": "Next.js",
    "slug": "next-js"
  },
  {
    "name": "Security",
    "slug": "security"
  },
  {
    "name": "Prisma",
    "slug": "prisma"
  }
]`;

  const getTagBySlugResponse = `{
  "tag": {
    "name": "Security",
    "slug": "security"
  },
  "posts": [
    {
      "title": "Securing Your Next.js App",
      "slug": "securing-next-js",
      "excerpt": "A comprehensive look at best practices for API and app security...",
      "publishedAt": "2025-07-21T14:30:00.000Z",
      "author": { "name": "Security Expert" }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Tags API
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
        Endpoints for retrieving tags and their associated posts.
      </p>

      <Endpoint
        method="GET"
        path="/tags"
        description="Retrieves a list of all tags for your organization."
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Response
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Returns an array of tag objects.
        </p>
        <CodeBlock code={getAllTagsResponse} language="json" />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/tags/{slug}"
        description="Retrieves a single tag and a paginated list of its published posts."
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Path Parameters
        </h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <code>slug</code>
            <Badge color="red">Required</Badge>
            <span className="text-gray-600 dark:text-gray-400">
              The unique slug of the tag.
            </span>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Query Parameters
        </h3>
        <ul className="list-none !p-0 space-y-4">
          <li className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <code>page</code>
            <Badge color="gray">Optional</Badge>
            <span className="text-gray-600 dark:text-gray-400">
              Page number for post pagination. Defaults to 1.
            </span>
          </li>
          <li className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <code>limit</code>
            <Badge color="gray">Optional</Badge>
            <span className="text-gray-600 dark:text-gray-400">
              Number of posts per page. Defaults to 10.
            </span>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Response
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Returns an object containing the tag details and a paginated list of
          posts.
        </p>
        <CodeBlock code={getTagBySlugResponse} language="json" />
      </Endpoint>
    </motion.div>
  );
}