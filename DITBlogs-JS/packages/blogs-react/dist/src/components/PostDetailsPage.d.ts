interface PostDetailsPageProps {
    /** The slug of the post to display. */
    slug: string;
    /**
     * The auth token (e.g., JWT) for the logged-in user, required for posting comments.
     * This should be managed by your main application's authentication system.
     */
    userToken?: string;
}
export declare function PostDetailsPage({ slug, userToken }: PostDetailsPageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PostDetailsPage.d.ts.map