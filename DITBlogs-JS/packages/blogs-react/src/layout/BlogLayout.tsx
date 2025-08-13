// /packages/blogs-react/src/layout/BlogLayout.tsx
"use client";

import { ElementType, ReactNode } from 'react';
import { DITBlogsProvider, useDITBlogsContext } from '../provider'; // Note: Only provider needs to be imported here now.
import { CustomTheme, Theme } from '../theme';

// DEFINE THE MISSING INTERFACE
interface BlogLayoutProps {
    children: ReactNode;
    apiKey: string;
    theme?: Theme | CustomTheme;
    navLinks?: { href: string; label: string }[];
    linkComponent?: ElementType;
}


// Header now uses the Link from context
function Header({ navLinks }: { navLinks?: { href: string; label: string }[] }) {
  const { Link } = useDITBlogsContext(); // Get the link component from our context
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-foreground">My Blog</Link>
        <div className="flex items-center gap-6">
          {navLinks?.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

// Footer with branding
function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} My Company, Inc. All Rights Reserved.</p>
        <p className="mt-2">
          Powered by <a href="https://blogs.dishis.tech" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">blogs.dishis.tech</a>
        </p>
      </div>
    </footer>
  );
}

// The main BlogLayout now passes the linkComponent to the provider
export function BlogLayout({ children, apiKey, theme, navLinks, linkComponent }: BlogLayoutProps) {
  return (
    <DITBlogsProvider apiKey={apiKey} theme={theme} linkComponent={linkComponent}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header navLinks={navLinks} />
        <main className="flex-grow container mx-auto px-6 py-12">{children}</main>
        <Footer />
      </div>
    </DITBlogsProvider>
  );
}