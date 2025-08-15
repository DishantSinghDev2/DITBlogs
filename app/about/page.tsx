import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const title = "About — DishIs Technologies | DITBlogs";
  const description =
    "DITBlogs by DishIs Technologies — a fast, SEO-first blogging platform built for developers and growth teams. Markdown, RSS, SEO schema, custom domains, and Core Web Vitals optimized out of the box.";

  return {
    title,
    description,
    keywords: [
      "DITBlogs",
      "DishIs Technologies",
      "blogging platform",
      "developer blog",
      "SEO-first CMS",
      "headless blog",
    ],
    openGraph: {
      title,
      description,
      siteName: "DishIs Technologies",
    },
  } as Metadata;
}

export default async function AboutPage() {
  const product = {
    name: "DITBlogs",
    brand: "DishIs Technologies",
    url: "https://dishis.tech",
    description:
      "DITBlogs is a lightweight, SEO-optimized blogging platform for developers and small teams. Ships with Markdown support, RSS, JSON-LD schema, custom domains, and performance-first defaults for great Core Web Vitals.",
    logo: "/images/ditblogs-logo.png",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Organization",
      name: product.brand,
      url: product.url,
    },
    url: product.url,
    image: product.logo,
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* JSON-LD for product & organization (improves rich results) */}
      <script
        type="application/ld+json"
        // Next.js server components allow injecting raw JSON-LD safely this way
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="space-y-6">
        <header className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold">About DITBlogs</h1>
            <p className="text-gray-600 mt-1">{product.description}</p>
          </div>
        </header>

        <article className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">What DITBlogs solves</h2>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Publish fast, SEO-optimized content without heavy CMS bloat.</li>
              <li>Native Markdown + frontmatter and automatic RSS generation.</li>
              <li>Built-in JSON-LD, Open Graph, and canonical controls to win SERP features.</li>
              <li>Fast defaults that help you achieve excellent Core Web Vitals.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Ideal for</h3>
            <p className="text-gray-700">Developers, indie makers, SaaS blogs, and technical content teams.</p>

            <h3 className="text-lg font-medium mt-4">Key integrations</h3>
            <p className="text-gray-700">Next.js, Markdown, Git-based content flows, RSS, Webhooks, optional headless APIs.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-medium">Technical highlights</h2>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Server-side rendered pages with static caching for blazing LCP.</li>
              <li>Structured data (JSON-LD) for Organization & Product to improve E-E-A-T signals.</li>
              <li>Automatic image sizing and lazy-loading to lower CLS and speed up LCP.</li>
              <li>Pre-built SEO components (meta, canonical, OG) and sitemap/RSS support.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Performance & SEO defaults</h3>
            <p className="text-gray-700">DITBlogs ships opinionated defaults to maximize organic growth:</p>
            <ol className="list-decimal pl-5 text-gray-700">
              <li>Fast core metrics targets (LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 100ms recommended).</li>
              <li>Schema-rich pages (Article, BreadcrumbList, Author) to increase chances of rich snippets.</li>
              <li>Server-side prerender + edge caching for bots and users.</li>
            </ol>
          </div>
        </article>

        <section className="border rounded-lg p-6 dark:bg-black dark:text-white text-black bg-gray-50">
          <h2 className="text-xl font-medium">Growth & adoption playbook (recommended)</h2>
          <ul className="pl-5 list-disc">
            <li>Run an internal content cluster strategy: 1 pillar article + 6 supporting posts.</li>
            <li>Instrument CTA clicks and sign-ups (GA4 + server-side event collection) — track conversions and CTAs per post.</li>
            <li>Use canonical + internal linking to funnel link equity to pillar pages.</li>
            <li>Expose an RSS and JSON feed for republishing and newsletter pipelines.</li>
          </ul>

          <div className="mt-4 flex gap-3">
            <a href="/products/ditblogs" className="inline-block rounded-md px-4 py-2 bg-slate-900 text-white">
              Learn more
            </a>
            <a href="/contact" className="inline-block rounded-md px-4 py-2 border">Contact sales</a>
          </div>
        </section>
      </section>
    </main>
  );
}
