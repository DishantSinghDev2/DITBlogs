import { CodeBlock } from "@/components/docs/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function ExamplesPage() {
  const curlExample = `API_KEY="YOUR_API_KEY"
BASE_URL="https://www.yourdomain.com/api/v1"
POST_SLUG="my-first-blog-post"

# 1. Fetch the post's comments to see existing discussion
curl -X GET "$BASE_URL/comments?postSlug=$POST_SLUG" \\
     -H "Authorization: Bearer $API_KEY"

# 2. Post a new comment
# This assumes you have a separate end-user JWT for this action
curl -X POST "$BASE_URL/comments" \\
     -H "Authorization: Bearer $API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{
       "content": "This is a new comment from cURL!",
       "postSlug": "'"$POST_SLUG"'"
     }'`;

  const nodeExample = `const API_KEY = process.env.DITBLOGS_API_KEY;
const BASE_URL = 'https://www.yourdomain.com/api/v1';

async function getComments(postSlug) {
  const url = \`\${BASE_URL}/comments?postSlug=\${postSlug}\`;
  const response = await fetch(url, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
    },
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  return response.json();
}

async function postComment(postSlug, content) {
  const url = \`\${BASE_URL}/comments\`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`, // Org key
      // 'X-User-Auth': 'Bearer USER_JWT',    // End-user auth token
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postSlug, content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(\`HTTP error! status: \${response.status}, message: \${JSON.stringify(errorData)}\`);
  }
  return response.json();
}

async function main() {
  const postSlug = 'my-first-blog-post';
  try {
    console.log('Fetching existing comments...');
    const comments = await getComments(postSlug);
    console.log('Found', comments.length, 'comments.');

    console.log('Posting a new comment...');
    const newComment = await postComment(postSlug, 'Hello from a Node.js script!');
    console.log('Successfully posted comment:', newComment);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();`;

  const pythonExample = `import os
import requests

API_KEY = os.getenv("DITBLOGS_API_KEY")
BASE_URL = "https://www.yourdomain.com/api/v1"
POST_SLUG = "my-first-blog-post"

def get_comments(slug):
    url = f"{BASE_URL}/comments"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    params = {"postSlug": slug}
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()  # Will raise an exception for 4xx/5xx errors
    return response.json()

def post_comment(slug, content):
    url = f"{BASE_URL}/comments"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        # "X-User-Auth": "Bearer USER_JWT", # End-user auth token
        "Content-Type": "application/json",
    }
    payload = {"postSlug": slug, "content": content}
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

def main():
    try:
        print("Fetching existing comments...")
        comments = get_comments(POST_SLUG)
        print(f"Found {len(comments)} comments.")

        print("Posting a new comment...")
        new_comment = post_comment(POST_SLUG, "Hello from a Python script!")
        print(f"Successfully posted comment: {new_comment}")
    except requests.exceptions.HTTPError as err:
        print(f"An HTTP error occurred: {err.response.status_code} {err.response.text}")
    except Exception as err:
        print(f"An error occurred: {err}")

if __name__ == "__main__":
    main()
`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Full Examples
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Here are some complete, end-to-end examples in different languages to
        help you get started quickly.
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-12">
        The common use case shown below is fetching all comments for a post and
        then submitting a new one.
      </p>

      <Tabs defaultValue="curl">
        <TabsList>
          <TabsTrigger value="curl">cURL</TabsTrigger>
          <TabsTrigger value="node">Node.js</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
        </TabsList>
        <TabsContent value="curl">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Perfect for quick tests from the command line.
          </p>
          <CodeBlock code={curlExample} language="bash" />
        </TabsContent>
        <TabsContent value="node">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            A modern example using `fetch`, suitable for backend scripts or
            server-side logic in web frameworks.
          </p>
          <CodeBlock code={nodeExample} language="javascript" />
        </TabsContent>
        <TabsContent value="python">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            A standard implementation using the popular `requests` library.
          </p>
          <CodeBlock code={pythonExample} language="python" />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}