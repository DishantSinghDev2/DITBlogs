// Re-export types for users of the SDK
export * from "./types";
export class DITBlogsClient {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("DITBlogsClient: API key is required.");
        }
        this.apiKey = apiKey;
        this.baseUrl = "https://blogs.dishis.tech/api/v1";
    }
    async _request(endpoint, options = {}) {
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
            return undefined;
        }
        return response.json();
    }
    // --- Post Endpoints ---
    getPosts(params = {}) {
        const query = new URLSearchParams({
            page: params.page?.toString() ?? '1',
            limit: params.limit?.toString() ?? '10',
            ...(params.category && { category: params.category }),
            ...(params.tag && { tag: params.tag }),
        }).toString();
        return this._request(`/posts?${query}`);
    }
    getPost(slug) {
        return this._request(`/posts/${slug}`);
    }
    // --- Category Endpoints ---
    getCategories() {
        return this._request(`/categories`);
    }
    getCategory(slug, params = {}) {
        const query = new URLSearchParams({
            page: params.page?.toString() ?? '1',
            limit: params.limit?.toString() ?? '10',
        }).toString();
        return this._request(`/categories/${slug}?${query}`);
    }
    // --- Tag Endpoints ---
    getTags() {
        return this._request(`/tags`);
    }
    getTag(slug, params = {}) {
        const query = new URLSearchParams({
            page: params.page?.toString() ?? '1',
            limit: params.limit?.toString() ?? '10',
        }).toString();
        return this._request(`/tags/${slug}?${query}`);
    }
    // --- Comment Endpoints ---
    getComments(postSlug) {
        const query = new URLSearchParams({ postSlug }).toString();
        return this._request(`/comments?${query}`);
    }
    postComment({ postSlug, content, parentId, userToken }) {
        return this._request('/comments', {
            method: 'POST',
            headers: {
                // Example of passing end-user auth alongside the org API key
                'X-User-Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ postSlug, content, parentId }),
        });
    }
}
