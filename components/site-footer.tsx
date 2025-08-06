"use client";

import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";

interface SiteFooterProps {
  variant?: 'full' | 'compact';
}

export function SiteFooter({ variant = 'full' }: SiteFooterProps) {

  // --- COMPACT FOOTER for Authenticated Pages ---
  if (variant === 'compact') {
    return (
      <footer className="bg-background border-t">
        <div className="container py-4">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>
              {`© ${new Date().getFullYear()} DITBlogs. All rights reserved.`}
            </p>
            <div className="flex items-center gap-x-4">
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // --- FULL FOOTER for Public Pages (Original Code) ---
  const footerNavigation = {
    main: [
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-background border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">DITBlogs</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {"The effortless blogging platform for your business."}
            </p>
            <div className="flex space-x-4">
              {/* Social Links rendering */}
              
               {/* ... other social links ... */}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Navigation</h3>
              <ul className="space-y-2">
                {footerNavigation.main.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2">
                {footerNavigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-sm text-muted-foreground">
            {`© ${new Date().getFullYear()} DITBlogs. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}