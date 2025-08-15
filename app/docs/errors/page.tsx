"use client";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Error Handling
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The DITBlogs API uses conventional HTTP status codes to indicate the
        success or failure of an API request. In general, codes in the{" "}
        <code className="bg-gray-100 dark:bg-gray-800 rounded-md px-1">
          2xx
        </code>{" "}
        range indicate success,{" "}
        <code className="bg-gray-100 dark:bg-gray-800 rounded-md px-1">
          4xx
        </code>{" "}
        range indicate a client-side error (e.g., a bad parameter), and{" "}
        <code className="bg-gray-100 dark:bg-gray-800 rounded-md px-1">
          5xx
        </code>{" "}
        range indicate a server-side error.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        HTTP Status Codes
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-2 font-semibold border-b dark:border-gray-600">
                Status Code
              </th>
              <th className="py-2 font-semibold border-b dark:border-gray-600">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="py-3 pr-4">
                <code>200 OK</code>
              </td>
              <td>The request was successful.</td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>201 Created</code>
              </td>
              <td>
                The resource was successfully created (e.g., after a POST
                request).
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>400 Bad Request</code>
              </td>
              <td>
                The request was malformed, such as having missing or invalid
                parameters.
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>401 Unauthorized</code>
              </td>
              <td>Authentication failed. The API key is missing or invalid.</td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>403 Forbidden</code>
              </td>
              <td>
                Authentication succeeded, but you do not have permission (e.g.,
                exceeded usage hard limit).
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>404 Not Found</code>
              </td>
              <td>The requested resource does not exist.</td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>429 Too Many Requests</code>
              </td>
              <td>
                You have hit the rate limit. Please slow down your requests.
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4">
                <code>500 Internal Server Error</code>
              </td>
              <td>Something went wrong on our end. Please try again later.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Error Response Body
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        When an error occurs, the API will respond with a JSON object
        containing an <code>error</code> key. For validation errors (400), the
        value may be an object detailing the specific fields.
      </p>

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
        400 Bad Request
      </h4>
      <CodeBlock code={error400} language="json" />

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
        401 Unauthorized
      </h4>
      <CodeBlock code={error401} language="json" />

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
        403 Forbidden
      </h4>
      <CodeBlock code={error403} language="json" />

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
        404 Not Found
      </h4>
      <CodeBlock code={error404} language="json" />

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
        429 Too Many Requests
      </h4>
      <CodeBlock code={error429} language="json" />

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
        500 Internal Server Error
      </h4>
      <CodeBlock code={error500} language="json" />
    </motion.div>
  );
}