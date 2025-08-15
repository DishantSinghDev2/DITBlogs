"use client";
import { Alert } from "@/components/docs/Alert";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { motion } from "framer-motion";

export default function RateLimitingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Rate Limiting
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        To ensure API stability and fair usage, we apply rate limiting to all
        requests. Our rate limiter operates on a sliding window basis.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        The Limits
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The primary rate limit is based on the API key used for the request.
        Currently, the limit is{" "}
        <strong className="text-gray-900 dark:text-white">
          10 requests per 10 seconds
        </strong>
        .
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        If you exceed this limit, the API will respond with an HTTP{" "}
        <code>429 Too Many Requests</code> error.
      </p>
      <CodeBlock code={`{ "error": "Too Many Requests." }`} language="json" />

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Rate Limit Headers
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Every API response includes the following headers to help you track your
        current rate limit status.
      </p>
      <ul className="list-disc !pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>
          <code>X-RateLimit-Limit</code>: The maximum number of requests allowed
          in the current window.
        </li>
        <li>
          <code>X-RateLimit-Remaining</code>: The number of requests remaining
          in the current window.
        </li>
        <li>
          <code>X-RateLimit-Reset</code>: The timestamp (in seconds since the
          epoch) when the rate limit window will reset.
        </li>
      </ul>

      <Alert type="info">
        <p className="font-semibold">Handle 429 errors gracefully</p>
        <p>
          We recommend building a small utility in your application that
          gracefully handles 429 errors, potentially with an exponential
          backoff retry strategy, using these headers.
        </p>
      </Alert>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
        Plan-Based Usage Quotas
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        In addition to rate limiting, your account is subject to a monthly usage
        quota based on your subscription plan (e.g., total post views). If you
        exceed your plan's soft limit, your requests will still succeed, but
        they will include a <code>X-Usage-Warning</code> header. If you exceed
        the hard limit (your plan's quota + a small buffer), your requests will
        be blocked with a <code>403 Forbidden</code> error.
      </p>
    </motion.div>
  );
}