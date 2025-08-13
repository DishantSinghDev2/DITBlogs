// /app/docs/page.tsx
import { Alert } from "@/components/docs/Alert";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function IntroductionPage() {
  return (
    <>
      <h1>API Introduction</h1>
      <p className="text-xl">
        Welcome to the DITBlogs API documentation. Our API provides programmatic
        access to manage and retrieve your blog content, including posts,
        categories, tags, and comments.
      </p>

      <h2>Base URL</h2>
      <p>All API endpoints are relative to the following base URL:</p>
      <CodeBlock code="https://www.yourdomain.com/api/v1" language="text" />

      <Alert type="info">
        <p>
          All API requests must be made over HTTPS. Calls made over plain HTTP
          will fail.
        </p>
      </Alert>

      <h2>Quickstart: Fetching Recent Posts</h2>
      <p>
        Here’s a quick example to get you started. This cURL command fetches the
        10 most recent posts from your organization. Don't forget to replace{" "}
        <code>YOUR_API_KEY</code> with your actual key.
      </p>
      <CodeBlock
        code={`curl --request GET \\
     --url 'https://www.yourdomain.com/api/v1/posts' \\
     --header 'Authorization: Bearer YOUR_API_KEY'`}
        language="bash"
      />
    </>
  );
}