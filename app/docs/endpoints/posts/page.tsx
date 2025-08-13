// /app/docs/endpoints/posts/page.tsx
import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Endpoint } from "@/components/docs/Endpoint";

export default function PostsEndpointPage() {
  const getPostsResponse = `{
  "posts": [
    {
      "title": "My First Blog Post",
      "slug": "my-first-blog-post",
      "excerpt": "This is a short summary of the post...",
      "publishedAt": "2025-08-12T19:28:43.383Z",
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

  const getPostBySlugResponse = `{
  "title": "My First Blog Post",
  "slug": "my-first-blog-post",
  "content": "<p>This is the full content of the post.</p>",
  "excerpt": "This is a short summary of the post...",
  "publishedAt": "2025-08-12T19:28:43.383Z",
  "author": {
    "name": "Admin User"
  },
  "category": {
    "name": "General",
    "slug": "general"
  }
}`;

  return (
    <>
      <h1>Posts API</h1>
      <p>Endpoints for retrieving posts.</p>

      <Endpoint
        method="GET"
        path="/posts"
        description="Retrieves a paginated list of published posts. Posts can be filtered by category or tag."
      >
        <h3 className="!mt-8 !mb-4">Query Parameters</h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2">
            <code>category</code>
            <Badge color="gray">Optional</Badge>
            <span>Slug of the category to filter by.</span>
          </li>
          <li className="flex items-center gap-4 py-2">
            <code>tag</code>
            <Badge color="gray">Optional</Badge>
            <span>Slug of the tag to filter by.</span>
          </li>
          <li className="flex items-center gap-4 py-2">
            <code>page</code>
            <Badge color="gray">Optional</Badge>
            <span>Page number for pagination. Defaults to 1.</span>
          </li>
          <li className="flex items-center gap-4 py-2">
            <code>limit</code>
            <Badge color="gray">Optional</Badge>
            <span>Number of items per page. Defaults to 10.</span>
          </li>
        </ul>

        <h3 className="!mt-8 !mb-4">Response</h3>
        <CodeBlock code={getPostsResponse} language="json" />
      </Endpoint>

      <Endpoint
        method="GET"
        path="/posts/{slug}"
        description="Retrieves a single published post by its unique slug."
      >
        <h3 className="!mt-8 !mb-4">Path Parameters</h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2">
            <code>slug</code>
            <Badge color="red">Required</Badge>
            <span>The unique slug of the post.</span>
          </li>
        </ul>
        <h3 className="!mt-8 !mb-4">Response</h3>
        <CodeBlock code={getPostBySlugResponse} language="json" />
      </Endpoint>
    </>
  );
}