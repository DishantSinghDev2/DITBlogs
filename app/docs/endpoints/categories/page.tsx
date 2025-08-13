// /app/docs/endpoints/categories/page.tsx
import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Endpoint } from "@/components/docs/Endpoint";

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
    <>
      <h1>Categories API</h1>
      <p>Endpoints for retrieving categories and their associated posts.</p>

      <Endpoint
        method="GET"
        path="/categories"
        description="Retrieves a list of all categories for your organization."
      >
        <h3 className="!mt-8 !mb-4">Response</h3>
        <p>Returns an array of category objects, each with a name and a slug.</p>
        <CodeBlock code={getAllCategoriesResponse} language="json" />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/categories/{slug}"
        description="Retrieves a single category and a paginated list of its published posts."
      >
        <h3 className="!mt-8 !mb-4">Path Parameters</h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2">
            <code>slug</code>
            <Badge color="red">Required</Badge>
            <span>The unique slug of the category.</span>
          </li>
        </ul>

        <h3 className="!mt-8 !mb-4">Query Parameters</h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2">
            <code>page</code>
            <Badge color="gray">Optional</Badge>
            <span>Page number for post pagination. Defaults to 1.</span>
          </li>
          <li className="flex items-center gap-4 py-2">
            <code>limit</code>
            <Badge color="gray">Optional</Badge>
            <span>Number of posts per page. Defaults to 10.</span>
          </li>
        </ul>

        <h3 className="!mt-8 !mb-4">Response</h3>
        <p>Returns an object containing the category details and a paginated list of posts.</p>
        <CodeBlock code={getCategoryBySlugResponse} language="json" />
      </Endpoint>
    </>
  );
}