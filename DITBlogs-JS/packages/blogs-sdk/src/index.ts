// src/index.ts
import {
  Post, PostsResponse, Category, CategoryResponse, Tag, TagResponse, Comment
} from "./types";

// Re-export types for users of the SDK
export * from "./types";

interface GetPostsParams {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

interface PostCommentParams {
  postSlug: string;
  content: string;
  parentId?: string;
  /** A JWT or session token for the end-user posting the comment. */
  userToken: string;
}

export class DITBlogsClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("DITBlogsClient: API key is required.");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://blogs.dishis.tech/api/v1";
  }

  private async _request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An unknown API error occurred." }));
      throw new Error(`API Error (${response.status}): ${JSON.stringify(errorData.error)}`);
    }
    
    // For 204 No Content response
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // --- Post Endpoints ---
  public getPosts(params: GetPostsParams = {}): Promise<PostsResponse> {
    const query = new URLSearchParams({
      page: params.page?.toString() ?? '1',
      limit: params.limit?.toString() ?? '10',
      ...(params.category && { category: params.category }),
      ...(params.tag && { tag: params.tag }),
    }).toString();
    return this._request<PostsResponse>(`/posts?${query}`);
  }

  public getPost(slug: string): Promise<Post> {
    return this._request<Post>(`/posts/${slug}`);
  }

  // --- Category Endpoints ---
  public getCategories(): Promise<Category[]> {
    return this._request<Category[]>(`/categories`);
  }
  
  public getCategory(slug: string, params: { page?: number, limit?: number } = {}): Promise<CategoryResponse> {
     const query = new URLSearchParams({
      page: params.page?.toString() ?? '1',
      limit: params.limit?.toString() ?? '10',
    }).toString();
    return this._request<CategoryResponse>(`/categories/${slug}?${query}`);
  }

  // --- Tag Endpoints ---
  public getTags(): Promise<Tag[]> {
    return this._request<Tag[]>(`/tags`);
  }

  public getTag(slug: string, params: { page?: number, limit?: number } = {}): Promise<TagResponse> {
     const query = new URLSearchParams({
      page: params.page?.toString() ?? '1',
      limit: params.limit?.toString() ?? '10',
    }).toString();
    return this._request<TagResponse>(`/tags/${slug}?${query}`);
  }

  // --- Comment Endpoints ---
  public getComments(postSlug: string): Promise<Comment[]> {
    const query = new URLSearchParams({ postSlug }).toString();
    return this._request<Comment[]>(`/comments?${query}`);
  }

  public postComment({ postSlug, content, parentId, userToken }: PostCommentParams): Promise<Comment> {
    return this._request<Comment>('/comments', {
      method: 'POST',
      headers: { 
        // Example of passing end-user auth alongside the org API key
        'X-User-Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ postSlug, content, parentId }),
    });
  }
}