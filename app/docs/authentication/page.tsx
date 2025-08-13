// /app/docs/authentication/page.tsx
import { Alert } from "@/components/docs/Alert";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function AuthenticationPage() {
  return (
    <>
      <h1>Authentication</h1>
      <p>
        The DITBlogs API uses API Keys to authenticate requests. You can view
        and manage your API keys in your organization's settings dashboard.
      </p>
      <p>
        All API requests must include an <code>Authorization</code> header
        containing your API key. The key should be prefixed with{" "}
        <code>Bearer </code> (with a space).
      </p>

      <Alert type="warning">
        <p>
          Your API keys carry many privileges, so be sure to keep them secret!
          Do not share your secret API keys in publicly accessible areas such as
          GitHub, client-side code, and so forth.
        </p>
      </Alert>
      
      <h2>Header Format</h2>
      <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} language="text" />
      
      <h2>Example Request</h2>
      <p>
        Here is an example of an authenticated request using cURL to fetch your
        organization's categories.
      </p>
      <CodeBlock
        code={`curl --request GET \\
     --url 'https://www.yourdomain.com/api/v1/categories' \\
     --header 'Authorization: Bearer YOUR_API_KEY' \\
     --header 'Content-Type: application/json'`}
        language="bash"
      />
    </>
  );
}