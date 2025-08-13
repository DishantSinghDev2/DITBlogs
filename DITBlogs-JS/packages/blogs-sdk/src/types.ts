// src/types.ts

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Author {
  name: string | null;
  image?: string | null;
}

export interface Category {
  name: string;
  slug: string;
  description?: string | null;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Post {
  title: string;
  slug: string;
  content?: string; // Content is optional in list view
  excerpt: string | null;
  publishedAt: string;
  author: Author;
  category?: { name: string; slug: string };
}

export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  parentId: string | null;
  replies: Comment[];
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface CategoryResponse {
  category: Category;
  posts: Post[];
  pagination: Pagination;
}

export interface TagResponse {
  tag: Tag;
  posts: Post[];
  pagination: Pagination;
}