# DITBlogs 🚀

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)![Prisma](https://img.shields.io/badge/Prisma-5-darkblue?logo=prisma)

The effortless, headless blogging platform designed for your business. Power your existing website with a feature-rich, collaborative blog without the hassle of a separate CMS.

## Video guide
[![Click to play](https://via.placeholder.com/640x360?text=Play+Video)](https://blogs.dishis.tech/vdo-guide.mp4)


## ✨ What is DITBlogs?

Tired of spinning up a whole new WordPress site or struggling with a clunky CMS just to add a blog to your company's website? **DITBlogs is the solution.**

DITBlogs is an API-first, multi-tenant blogging platform that provides the backend, a powerful editor, and the infrastructure you need. You simply connect it to your website via its API to create a seamless, beautifully integrated blog that matches your brand. It's built for teams, designed for performance, and focused on one thing: making your organization's content management a joy.

## 🎯 Who is it For?

DITBlogs is built for a modern workflow and is perfect for:

*   🏢 **Businesses & Startups** who want to add a content marketing channel to their existing website without a complex technical overhaul.
*   ✍️ **Content Teams** that need a collaborative environment with different roles (Admins, Editors, Writers) to manage their content pipeline.
*   🏗️ **Developers** looking for a flexible, headless CMS that provides a clean API, robust authentication, and a solid foundation to build upon.
*   🎨 **Agencies** that need a reliable, repeatable solution for adding a high-quality blog to their clients' websites.

## 🌟 Key Features

DITBlogs is packed with features designed for a professional content workflow:

*   🌐 **Headless Architecture:** Use the secure API to fetch and display your posts on any frontend framework (Next.js, React, Vue, Svelte, etc.).
*   🏢 **Multi-Tenant Organizations:** Each organization gets its own secure workspace. Users, posts, and analytics are all scoped to the organization.
*   🔐 **Role-Based Access Control (RBAC):**
    *   **Org Admin:** Manages members, settings, and has full content control.
    *   **Editor:** Can create, edit, and publish any post within the organization.
    *   **Writer:** Can create and edit their own posts, which can then be reviewed.
*   ✨ **Modern Block-Based Editor:** A beautiful and intuitive writing experience powered by Tiptap, with support for rich text, images, code blocks, and more.
*   💾 **Intelligent Auto-Saving:** Drafts are saved automatically after a period of inactivity, ensuring no work is ever lost.
*   📧 **Email Invitation System:** Admins can easily invite new members to their organization via email, powered by Nodemailer.
*   📊 **Scoped Analytics Dashboard:** A beautiful, interactive dashboard (using Chart.js) that provides admins with key insights into their organization's content performance, including views, top posts, and top authors.
*   👋 **Seamless User Onboarding:** A multi-step, state-aware onboarding flow that intelligently guides new users based on their role, pending invitations, or application status.
*   🔒 **Secure by Design:** All API endpoints are protected and context-aware, ensuring a user from one organization can never access the data of another.
*   🎨 **Themeable & Customizable:** Built with Tailwind CSS and shadcn/ui, making it easy to adapt the look and feel to your brand.

## 🛠️ Tech Stack

DITBlogs is built with a modern, type-safe, and scalable technology stack:

| Category          | Technology                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Framework**     | ![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js) (with App Router)                    |
| **Language**      | ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)                               |
| **Database**      | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)                                |
| **ORM**           | ![Prisma](https://img.shields.io/badge/Prisma-5-darkblue?logo=prisma)                                         |
| **Authentication**| ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4-blue?logo=nextdotjs)                                  |
| **UI Components** | ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?logo=react)                                         |
| **Styling**       | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)                          |
| **Animation**     | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-10-blue?logo=framer)                               |
| **Charts**        | ![Chart.js](https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs)                                   |
| **Email**         | ![Nodemailer](https://img.shields.io/badge/Nodemailer-6-4B8505?logo=nodedotjs)                                    |
| **Caching**       | ![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)                                             |
| **Validation**    | ![Zod](https://img.shields.io/badge/Zod-3-blue?logo=zod)                                                     |

## 🔌 Public API

DITBlogs exposes a versioned REST API (`/api/v1/`) that lets you read **and write** content from any external system — your website, a CI pipeline, a migration script, or a custom integration.

Full reference: **[docs/api.md](docs/api.md)**

### Quick start

1. Go to your organization's **Settings → API Keys** and create a key.
2. Include it as a Bearer token on every request:

```http
Authorization: Bearer ditb_<your-key>
```

### Read endpoints (GET)

| Endpoint | Description |
|---|---|
| `GET /api/v1/posts` | List published posts (paginated) |
| `GET /api/v1/posts/:slug` | Get a single post by slug |
| `GET /api/v1/categories` | List categories |
| `GET /api/v1/tags` | List tags |
| `GET /api/v1/comments` | List comments |

### Write endpoints (POST / PUT / DELETE)

| Endpoint | Description |
|---|---|
| `POST /api/v1/posts` | Create a post (draft by default) |
| `PUT /api/v1/posts/:slug` | Partial-update a post |
| `DELETE /api/v1/posts/:slug` | Delete a post |
| `POST /api/v1/posts/:slug/publish` | Publish a draft |
| `POST /api/v1/posts/:slug/unpublish` | Revert a post to draft |

> All write operations are scoped to the organization that owns the API key.