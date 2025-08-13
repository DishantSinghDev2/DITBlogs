// /app/docs/rate-limiting/page.tsx
import { Alert } from "@/components/docs/Alert";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function RateLimitingPage() {
  return (
    <>
      <h1>Rate Limiting</h1>
      <p>
        To ensure API stability and fair usage, we apply rate limiting to all
        requests. Our rate limiter operates on a sliding window basis.
      </p>

      <h2>The Limits</h2>
      <p>
        The primary rate limit is based on the API key used for the request.
        Currently, the limit is <strong>10 requests per 10 seconds</strong>.
      </p>
      <p>
        If you exceed this limit, the API will respond with an HTTP `429 Too Many Requests` error.
      </p>
      <CodeBlock code={`{ "error": "Too Many Requests." }`} language="json" />

      <h2>Rate Limit Headers</h2>
      <p>
        Every API response includes the following headers to help you track your
        current rate limit status.
      </p>
      <ul className="list-disc !pl-6">
        <li>
          <code>X-RateLimit-Limit</code>: The maximum number of requests allowed in the current window.
        </li>
        <li>
          <code>X-RateLimit-Remaining</code>: The number of requests remaining in the current window.
        </li>
        <li>
          <code>X-RateLimit-Reset</code>: The timestamp (in seconds since the epoch) when the rate limit window will reset.
        </li>
      </ul>

      <Alert type="info">
        <p>
          We recommend building a small utility in your application that gracefully handles 429 errors, potentially with an exponential backoff retry strategy, using these headers.
        </p>
      </Alert>

      <h2>Plan-Based Usage Quotas</h2>
      <p>
        In addition to rate limiting, your account is subject to a monthly usage quota based on your subscription plan (e.g., total post views). If you exceed your plan's soft limit, your requests will still succeed, but they will include a `X-Usage-Warning` header. If you exceed the hard limit (your plan's quota + a small buffer), your requests will be blocked with a `403 Forbidden` error.
      </p>
    </>
  );
}