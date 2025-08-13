// /app/docs/errors/page.tsx
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function ErrorsPage() {
  const error400 = `{
  "error": {
    "postSlug": ["Post slug is required."]
  }
}`;
  const error401 = `{ "error": "Unauthorized: Invalid API key." }`;
  const error403 = `{ "error": "Usage limit exceeded. Your plan's hard limit is 100,000 views per month." }`;
  const error404 = `{ "error": "Post not found." }`;
  const error429 = `{ "error": "Too Many Requests." }`;
  const error500 = `{ "error": "Internal Server Error" }`;

  return (
    <>
      <h1>Error Handling</h1>
      <p>
        The DITBlogs API uses conventional HTTP status codes to indicate the success or failure of an API request. In general, codes in the `2xx` range indicate success, `4xx` range indicate a client-side error (e.g., a bad parameter), and `5xx` range indicate a server-side error.
      </p>

      <h2>HTTP Status Codes</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="py-2 font-semibold border-b dark:border-gray-600">Status Code</th>
            <th className="py-2 font-semibold border-b dark:border-gray-600">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>200 OK</code></td>
            <td>The request was successful.</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>201 Created</code></td>
            <td>The resource was successfully created (e.g., after a POST request).</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>400 Bad Request</code></td>
            <td>The request was malformed, such as having missing or invalid parameters.</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>401 Unauthorized</code></td>
            <td>Authentication failed. The API key is missing or invalid.</td>
          </tr>
           <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>403 Forbidden</code></td>
            <td>Authentication succeeded, but you do not have permission (e.g., exceeded usage hard limit).</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>404 Not Found</code></td>
            <td>The requested resource does not exist.</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="py-3 pr-4"><code>429 Too Many Requests</code></td>
            <td>You have hit the rate limit. Please slow down your requests.</td>
          </tr>
          <tr>
            <td className="py-3 pr-4"><code>500 Internal Server Error</code></td>
            <td>Something went wrong on our end. Please try again later.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="!mt-12">Error Response Body</h2>
      <p>When an error occurs, the API will respond with a JSON object containing an `error` key. For validation errors (400), the value may be an object detailing the specific fields.</p>
      
      <h4>400 Bad Request</h4>
      <CodeBlock code={error400} language="json" />

      <h4>401 Unauthorized</h4>
      <CodeBlock code={error401} language="json" />

      <h4>403 Forbidden</h4>
      <CodeBlock code={error403} language="json" />

      <h4>404 Not Found</h4>
      <CodeBlock code={error404} language="json" />

      <h4>429 Too Many Requests</h4>
      <CodeBlock code={error429} language="json" />

      <h4>500 Internal Server Error</h4>
      <CodeBlock code={error500} language="json" />
    </>
  );
}