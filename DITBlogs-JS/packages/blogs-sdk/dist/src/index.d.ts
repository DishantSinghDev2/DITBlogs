import { Post, PostsResponse, Category, CategoryResponse, Tag, TagResponse, Comment } from "./types";
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
export declare class DITBlogsClient {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    private _request;
    getPosts(params?: GetPostsParams): Promise<PostsResponse>;
    getPost(slug: string): Promise<Post>;
    getCategories(): Promise<Category[]>;
    getCategory(slug: string, params?: {
        page?: number;
        limit?: number;
    }): Promise<CategoryResponse>;
    getTags(): Promise<Tag[]>;
    getTag(slug: string, params?: {
        page?: number;
        limit?: number;
    }): Promise<TagResponse>;
    getComments(postSlug: string): Promise<Comment[]>;
    postComment({ postSlug, content, parentId, userToken }: PostCommentParams): Promise<Comment>;
}
//# sourceMappingURL=index.d.ts.map