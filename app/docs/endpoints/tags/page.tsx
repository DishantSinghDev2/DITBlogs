// /app/docs/endpoints/tags/page.tsx
import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Endpoint } from "@/components/docs/Endpoint";

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
    <>
      <h1>Tags API</h1>
      <p>Endpoints for retrieving tags and their associated posts.</p>

      <Endpoint
        method="GET"
        path="/tags"
        description="Retrieves a list of all tags for your organization."
      >
        <h3 className="!mt-8 !mb-4">Response</h3>
        <p>Returns an array of tag objects.</p>
        <CodeBlock code={getAllTagsResponse} language="json" />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/tags/{slug}"
        description="Retrieves a single tag and a paginated list of its published posts."
      >
        <h3 className="!mt-8 !mb-4">Path Parameters</h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2">
            <code>slug</code>
            <Badge color="red">Required</Badge>
            <span>The unique slug of the tag.</span>
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
        <p>Returns an object containing the tag details and a paginated list of posts.</p>
        <CodeBlock code={getTagBySlugResponse} language="json" />
      </Endpoint>
    </>
  );
}