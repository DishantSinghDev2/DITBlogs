"use client";
import { Alert } from "@/components/docs/Alert";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { motion } from "framer-motion";

export default function AuthenticationPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Authentication
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The DITBlogs API uses API Keys to authenticate requests. You can view
        and manage your API keys in your organization's settings dashboard.
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        All API requests must include an <code>Authorization</code> header
        containing your API key. The key should be prefixed with{" "}
        <code>Bearer </code> (with a space).
      </p>

      <Alert type="warning">
        <p className="font-semibold">Keep your API keys secret!</p>
        <p>
          Your API keys carry many privileges, so be sure to keep them secret!
          Do not share your secret API keys in publicly accessible areas such as
          GitHub, client-side code, and so forth.
        </p>
      </Alert>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Header Format
      </h2>
      <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} language="text" />

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Example Request
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Here is an example of an authenticated request using cURL to fetch your
        organization's categories.
      </p>
      <CodeBlock
        code={`curl --request GET \\\n     --url 'https://www.yourdomain.com/api/v1/categories' \\\n     --header 'Authorization: Bearer YOUR_API_KEY' \\\n     --header 'Content-Type: application/json'`}
        language="bash"
      />
    </motion.div>
  );
}