# DITBlogs Public API Reference

Base URL: `https://blogs.dishis.tech/api/v1`

All endpoints require an API key issued from **Settings → API Keys** inside your organization's dashboard.

---

## Authentication

Pass your key as a Bearer token on every request:

```http
Authorization: Bearer ditb_<your-key>
```

Keys are scoped to the organization that created them. You cannot read or write data belonging to another organization.

---

## Rate Limits

| Operation | Limit |
|---|---|
| Read (GET) | 10 requests / 10 seconds |
| Write (POST / PUT / DELETE) | 20 requests / 60 seconds |

When a limit is exceeded the API returns `429 Too Many Requests`.

> Read requests also count against your plan's monthly view quota. A warning header `X-Usage-Warning` is added when you approach the soft limit.

---

## Common Response Shapes

### Error

```json
{
  "error": "Human-readable message or field-level validation object"
}
```

HTTP status codes used: `400` bad request · `401` missing/invalid key · `404` not found · `409` conflict · `429` rate limited · `500` server error.

---

## Posts

### `GET /api/v1/posts`

List published posts for your organization.

**Query parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page (max 100) |
| `category` | string | — | Filter by category slug |
| `tag` | string | — | Filter by tag slug |

**Response `200`**

```json
{
  "posts": [
    {
      "title": "My First Post",
      "slug": "my-first-post",
      "excerpt": "A short summary...",
      "publishedAt": "2025-05-16T10:00:00.000Z",
      "author": { "name": "Dishant Singh" }
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### `GET /api/v1/posts/:slug`

Fetch a single post by its slug. Also records a view and increments the organization's monthly view counter.

**Response `200`**

```json
{
  "id": "clx...",
  "title": "My First Post",
  "slug": "my-first-post",
  "content": { ... },
  "excerpt": "A short summary...",
  "publishedAt": "2025-05-16T10:00:00.000Z",
  "featuredImage": "https://example.com/image.jpg",
  "author": { "name": "Dishant Singh", "image": "...", "bio": "..." },
  "category": { "name": "Engineering", "slug": "engineering" },
  "tags": [{ "name": "Next.js", "slug": "nextjs" }]
}
```

---

### `POST /api/v1/posts`

Create a new post. The post is saved as a **draft** by default (`publishedAt` is null). Pass `"publish": true` to go live immediately.

The post is automatically attributed to the organization owner. Tags and categories are **upserted by slug** — you don't need to create them first. Slugs are auto-generated from the title if omitted, and deduplicated automatically on conflict.

**Request body**

```json
{
  "title": "My New Post",
  "content": { "type": "doc", "content": [...] },
  "slug": "my-new-post",
  "excerpt": "A short teaser.",
  "featuredImage": "https://example.com/cover.jpg",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description",
  "categorySlug": "engineering",
  "tags": ["Next.js", "TypeScript"],
  "publish": false,
  "featured": false
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | Min 3 characters |
| `content` | JSON | Yes | TipTap document JSON |
| `slug` | string | No | Auto-generated from title if omitted |
| `excerpt` | string | No | |
| `featuredImage` | string (URL) | No | |
| `metaTitle` | string | No | |
| `metaDescription` | string | No | |
| `categorySlug` | string | No | Created automatically if it doesn't exist |
| `tags` | string[] | No | Tag names or slugs; upserted automatically |
| `publish` | boolean | No | Default `false` |
| `featured` | boolean | No | Default `false` |

**Response `201`**

```json
{
  "id": "clx...",
  "title": "My New Post",
  "slug": "my-new-post",
  "excerpt": "A short teaser.",
  "publishedAt": null,
  "featured": false,
  "category": { "name": "Engineering", "slug": "engineering" },
  "tags": [{ "name": "Next.js", "slug": "nextjs" }]
}
```

---

### `PUT /api/v1/posts/:slug`

Partially update a post. Only send the fields you want to change — omitted fields are left untouched.

**Tags are replaced wholesale** when the `tags` array is provided. Omit `tags` entirely to leave them as-is.

Set `"categorySlug": null` to remove the category. Set `"featuredImage": null` to clear it.

**Request body** (all fields optional)

```json
{
  "title": "Updated Title",
  "content": { "type": "doc", "content": [...] },
  "slug": "updated-title",
  "excerpt": "Updated teaser.",
  "featuredImage": "https://example.com/new-cover.jpg",
  "metaTitle": "Updated SEO title",
  "metaDescription": "Updated SEO description",
  "categorySlug": "product",
  "tags": ["Release Notes"],
  "featured": true
}
```

**Response `200`** — same shape as the `POST` response.

---

### `DELETE /api/v1/posts/:slug`

Permanently delete a post and invalidate its cache.

**Response `200`**

```json
{ "message": "Post deleted." }
```

---

### `POST /api/v1/posts/:slug/publish`

Set `publishedAt` to the current timestamp. Returns `409` if the post is already published.

**Response `200`**

```json
{
  "id": "clx...",
  "title": "My New Post",
  "slug": "my-new-post",
  "publishedAt": "2025-05-16T12:34:56.000Z"
}
```

---

### `POST /api/v1/posts/:slug/unpublish`

Set `publishedAt` to `null`, returning the post to draft state. Returns `409` if the post is already a draft.

**Response `200`**

```json
{
  "id": "clx...",
  "title": "My New Post",
  "slug": "my-new-post",
  "publishedAt": null
}
```

---

## Categories

### `GET /api/v1/categories`

List all categories for your organization.

### `GET /api/v1/categories/:slug`

Get a single category with its posts.

---

## Tags

### `GET /api/v1/tags`

List all tags for your organization.

### `GET /api/v1/tags/:slug`

Get a single tag with its posts.

---

## Comments

### `GET /api/v1/comments`

List comments. Scoped to your organization's posts.

---

## Newsletter

### `POST /api/v1/newsletter/subscribe`

Subscribe an email address to your organization's newsletter.

```json
{ "email": "reader@example.com", "name": "Jane Doe" }
```

---

## Code examples

### Create and immediately publish a post (Node.js)

```js
const res = await fetch("https://blogs.dishis.tech/api/v1/posts", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ditb_<your-key>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Hello from the API",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "My first API-created post." }],
        },
      ],
    },
    tags: ["api", "automation"],
    publish: true,
  }),
});

const post = await res.json();
console.log(post.slug); // "hello-from-the-api"
```

### Update a post (Python)

```python
import requests

headers = {
    "Authorization": "Bearer ditb_<your-key>",
    "Content-Type": "application/json",
}

res = requests.put(
    "https://blogs.dishis.tech/api/v1/posts/hello-from-the-api",
    headers=headers,
    json={"excerpt": "Updated teaser.", "featured": True},
)

print(res.json())
```

### Publish a draft (cURL)

```bash
curl -X POST https://blogs.dishis.tech/api/v1/posts/hello-from-the-api/publish \
  -H "Authorization: Bearer ditb_<your-key>"
```
