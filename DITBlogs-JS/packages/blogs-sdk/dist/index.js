"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DITBlogsClient: () => DITBlogsClient
});
module.exports = __toCommonJS(index_exports);
var DITBlogsClient = class {
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
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An unknown API error occurred." }));
      throw new Error(`API Error (${response.status}): ${JSON.stringify(errorData.error)}`);
    }
    if (response.status === 204) {
      return void 0;
    }
    return response.json();
  }
  // --- Post Endpoints ---
  getPosts(params = {}) {
    const query = new URLSearchParams({
      page: params.page?.toString() ?? "1",
      limit: params.limit?.toString() ?? "10",
      ...params.category && { category: params.category },
      ...params.tag && { tag: params.tag }
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
      page: params.page?.toString() ?? "1",
      limit: params.limit?.toString() ?? "10"
    }).toString();
    return this._request(`/categories/${slug}?${query}`);
  }
  // --- Tag Endpoints ---
  getTags() {
    return this._request(`/tags`);
  }
  getTag(slug, params = {}) {
    const query = new URLSearchParams({
      page: params.page?.toString() ?? "1",
      limit: params.limit?.toString() ?? "10"
    }).toString();
    return this._request(`/tags/${slug}?${query}`);
  }
  // --- Comment Endpoints ---
  getComments(postSlug) {
    const query = new URLSearchParams({ postSlug }).toString();
    return this._request(`/comments?${query}`);
  }
  postComment({ postSlug, content, parentId, userToken }) {
    return this._request("/comments", {
      method: "POST",
      headers: {
        // Example of passing end-user auth alongside the org API key
        "X-User-Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({ postSlug, content, parentId })
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DITBlogsClient
});
