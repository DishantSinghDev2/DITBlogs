"use client";
import { Badge } from "@/components/docs/Badge";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Endpoint } from "@/components/docs/Endpoint";
import { Alert } from "@/components/docs/Alert";
import { motion } from "framer-motion";

export default function CommentsEndpointPage() {
  const getCommentsResponse = `[
  {
    "id": "clwbigexs000008l4hy227j4a",
    "content": "This is a great post, very informative!",
    "createdAt": "2025-08-12T10:30:00.000Z",
    "user": {
      "id": "user_2aVq...",
      "name": "Alice",
      "image": "https://.../alice.png"
    },
    "parentId": null,
    "replies": [
      {
        "id": "clwbigz2h000208l44f1g1g1g",
        "content": "I agree, I learned a lot.",
        "createdAt": "2025-08-12T11:00:00.000Z",
        "user": {
          "id": "user_2bXy...",
          "name": "Bob",
          "image": "https://.../bob.png"
        },
        "parentId": "clwbigexs000008l4hy227j4a",
        "replies": []
      }
    ]
  }
]`;

  const postCommentBody = `{
  "content": "This is a fantastic article!",
  "postSlug": "my-first-blog-post"
}`;

  const postReplyBody = `{
  "content": "This is a reply to a comment.",
  "postSlug": "my-first-blog-post",
  "parentId": "clwbigexs000008l4hy227j4a"
}`;

  const postCommentResponse = `{
  "id": "clwbii7k9000408l4e6q7h7h7",
  "content": "This is a fantastic article!",
  "createdAt": "2025-08-12T12:00:00.000Z",
  "parentId": null,
  "user": {
    "id": "user_2cVz...",
    "name": "Charlie",
    "image": "https://.../charlie.png"
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Comments API
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
        Endpoints for retrieving and submitting comments.
      </p>

      <Endpoint
        method="GET"
        path="/comments"
        description="Retrieves all comments for a specific post, structured hierarchically with replies."
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Query Parameters
        </h3>
        <ul className="list-none !p-0">
          <li className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <code>postSlug</code>
            <Badge color="red">Required</Badge>
            <span className="text-gray-600 dark:text-gray-400">
              The slug of the post to fetch comments for.
            </span>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Response
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Returns an array of top-level comment objects. Each comment can
          contain a `replies` array with nested comment objects.
        </p>
        <CodeBlock code={getCommentsResponse} language="json" />
      </Endpoint>

      <Endpoint
        method="POST"
        path="/comments"
        description="Submits a new comment or a reply to an existing comment. Requires end-user authentication."
      >
        <Alert type="warning">
          <p className="font-semibold">End-User Authentication Required</p>
          <p>
            This endpoint requires a separate end-user authentication layer
            (e.g., JWT in the `Authorization` header) to identify the
            commenter. The organization API key is still required to authorize
            the action against your account.
          </p>
        </Alert>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Request Body
        </h3>
        <ul className="list-none !p-0 space-y-4">
          <li className="py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <code>content</code> <Badge color="red">Required</Badge>
            </div>
            <p className="!m-0 text-gray-600 dark:text-gray-400 mt-1">
              The text content of the comment.
            </p>
          </li>
          <li className="py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <code>postSlug</code> <Badge color="red">Required</Badge>
            </div>
            <p className="!m-0 text-gray-600 dark:text-gray-400 mt-1">
              The slug of the post being commented on.
            </p>
          </li>
          <li className="py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <code>parentId</code> <Badge color="gray">Optional</Badge>
            </div>
            <p className="!m-0 text-gray-600 dark:text-gray-400 mt-1">
              The ID of the parent comment if this is a reply.
            </p>
          </li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
          Example Body (New Comment)
        </h4>
        <CodeBlock code={postCommentBody} language="json" />

        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-2">
          Example Body (Reply)
        </h4>
        <CodeBlock code={postReplyBody} language="json" />

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Response (Status 201)
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Returns the newly created comment object.
        </p>
        <CodeBlock code={postCommentResponse} language="json" />
      </Endpoint>
    </motion.div>
  );
}