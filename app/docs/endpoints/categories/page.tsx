import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Endpoint } from "@/components/docs/Endpoint";
import { motion } from "framer-motion";

export default function CategoriesEndpointPage() {
  const getAllCategoriesResponse = `[
  {
    "name": "Featured",
    "slug": "featured"
  },
  {
    "name": "Tech Guides",
    "slug": "tech-guides"
  },
  {
    "name": "Announcements",
    "slug": "announcements"
  }
]`;

  const getCategoryBySlugResponse = `{
  "category": {
    "name": "Tech Guides",
    "slug": "tech-guides",
    "description": "In-depth tutorials and guides on modern technology."
  },
  "posts": [
    {
      "title": "How to Set Up a Production-Ready API",
      "slug": "production-api-guide",
      "excerpt": "A step-by-step guide to deploying your API with confidence...",
      "publishedAt": "2025-08-10T11:00:00.000Z",
      "author": { "name": "Admin User" }
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
        Categories API
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
        Endpoints for retrieving categories and their associated posts.
      </p>

      <Endpoint
        method="GET"
        path="/categories"
        description="Retrieves a list of all categories for your organization."
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Response
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Returns an array of category objects, each with a name and a slug.
        </p>
        <CodeBlock code={getAllCategoriesResponse} language="json" />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/categories/{slug}"
        description="Retrieves a single category and a paginated list of its published posts."
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Path Parameters
        </h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <code>slug</code>
            <Badge color="red">Required</Badge>
            <span className="text-gray-600 dark:text-gray-400">
              The unique slug of the category.
            </span>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Query Parameters
        </h3>
        <ul className="list-none !p-0">
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
          Returns an object containing the category details and a paginated
          list of posts.
        </p>
        <CodeBlock code={getCategoryBySlugResponse} language="json" />
      </Endpoint>
    </motion.div>
  );
}