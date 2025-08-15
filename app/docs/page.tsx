"use client";
import { Alert } from "@/components/docs/Alert";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { motion } from "framer-motion";

export default function IntroductionPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        API Introduction
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Welcome to the DITBlogs API documentation. Our API provides programmatic
        access to manage and retrieve your blog content, including posts,
        categories, tags, and comments.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Base URL
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        All API endpoints are relative to the following base URL:
      </p>
      <CodeBlock code="https://www.yourdomain.com/api/v1" language="text" />

      <Alert type="info">
        <p>
          All API requests must be made over HTTPS. Calls made over plain HTTP
          will fail.
        </p>
      </Alert>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Quickstart: Fetching Recent Posts
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Here’s a quick example to get you started. This cURL command fetches the
        10 most recent posts from your organization. Don't forget to replace{" "}
        <code>YOUR_API_KEY</code> with your actual key.
      </p>
      <CodeBlock
        code={`curl --request GET \\\n     --url 'https://www.yourdomain.com/api/v1/posts' \\\n     --header 'Authorization: Bearer YOUR_API_KEY'`}
        language="bash"
      />
    </motion.div>
  );
}