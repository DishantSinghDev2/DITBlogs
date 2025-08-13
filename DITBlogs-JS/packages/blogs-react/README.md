# DITBlogs React Components - @dishistech/blogs-react

Official, production-ready React components for [blogs.dishis.tech](https://blogs.dishis.tech).

Instantly add a full-featured, themed, and performant blog to your React or Next.js application.

## Features

-   **Theming**: Full support for "light", "dark", and custom color themes.
-   **Component-Driven**: Use full-page components for instant setup or granular components for custom layouts.
-   **Built-in States**: Automatic skeletons, error messages, and empty states.
-   **Pagination**: Full pagination support out of the box.
-   **Developer Experience**: Written in TypeScript with a clean, easy-to-use API.

## Installation

```bash
pnpm add @dishistech/blogs-react @dishistech/blogs-sdk react react-dom swr lucide-react
```

## Quick Start

Wrap your application's root layout with our `BlogLayout` provider.

```tsx
// /app/layout.tsx
import { BlogLayout } from '@dishistech/blogs-react';
import '@dishistech/blogs-react/dist/index.css'; // Add this if you export a CSS file

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BlogLayout
          apiKey={process.env.DITBLOGS_API_KEY!}
          theme="dark"
        >
          {children}
        </BlogLayout>
      </body>
    </html>
  );
}
```

Then, use our full-page components in your page files.

```tsx
// /app/page.tsx
import { PostsListPage } from '@dishistech/blogs-react';

export default function HomePage() {
  return <PostsListPage />;
}
```

## Customization

For full customization, provide a custom theme object to the `BlogLayout` component.

[...More documentation on theming...]