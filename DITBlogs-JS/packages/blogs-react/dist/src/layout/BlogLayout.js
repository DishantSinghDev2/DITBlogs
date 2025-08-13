// /packages/blogs-react/src/layout/BlogLayout.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DITBlogsProvider, useDITBlogsContext } from '../provider'; // Note: Only provider needs to be imported here now.
// Header now uses the Link from context
function Header({ navLinks }) {
    const { Link } = useDITBlogsContext(); // Get the link component from our context
    return (_jsx("header", { className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur", children: _jsxs("nav", { className: "container mx-auto px-6 h-16 flex items-center justify-between", children: [_jsx(Link, { href: "/", className: "text-2xl font-bold text-foreground", children: "My Blog" }), _jsx("div", { className: "flex items-center gap-6", children: navLinks?.map(link => (_jsx(Link, { href: link.href, className: "text-sm font-medium text-muted-foreground hover:text-foreground", children: link.label }, link.href))) })] }) }));
}
// Footer with branding
function Footer() {
    return (_jsx("footer", { className: "border-t mt-16", children: _jsxs("div", { className: "container mx-auto px-6 py-8 text-center text-sm text-muted-foreground", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " My Company, Inc. All Rights Reserved."] }), _jsxs("p", { className: "mt-2", children: ["Powered by ", _jsx("a", { href: "https://blogs.dishis.tech", target: "_blank", rel: "noopener noreferrer", className: "font-semibold text-primary hover:underline", children: "blogs.dishis.tech" })] })] }) }));
}
// The main BlogLayout now passes the linkComponent to the provider
export function BlogLayout({ children, apiKey, theme, navLinks, linkComponent }) {
    return (_jsx(DITBlogsProvider, { apiKey: apiKey, theme: theme, linkComponent: linkComponent, children: _jsxs("div", { className: "flex flex-col min-h-screen bg-background text-foreground", children: [_jsx(Header, { navLinks: navLinks }), _jsx("main", { className: "flex-grow container mx-auto px-6 py-12", children: children }), _jsx(Footer, {})] }) }));
}
