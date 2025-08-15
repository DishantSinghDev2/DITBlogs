import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Terms of Service — DITBlogs | DishIs Technologies";
  const description =
    "Read the Terms of Service for DITBlogs by DishIs Technologies. Understand your rights, responsibilities, and the rules for using our blogging platform.";

  return {
    title,
    description,
    keywords: [
      "DITBlogs Terms of Service",
      "DITBlogs legal",
      "blogging platform terms",
      "DishIs Technologies policies",
    ],
    openGraph: {
      title,
      description,
      siteName: "DishIs Technologies",
    },
  };
}

export default async function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DITBlogs Terms of Service",
    description:
      "Terms of Service for DITBlogs, the blogging platform by DishIs Technologies.",
    url: "https://dishis.tech/terms",
    publisher: {
      "@type": "Organization",
      name: "DishIs Technologies",
      url: "https://dishis.tech",
      logo: "https://dishis.tech/logo.png",
    },
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-8">
        Last updated: {new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing or using DITBlogs, you agree to be bound by these Terms
            of Service and all applicable laws and regulations. If you do not
            agree, you may not use the platform.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Service Description</h2>
          <p className="text-gray-700">
            DITBlogs is a blogging platform by DishIs Technologies designed for
            fast, SEO-friendly publishing. Features may change over time at our
            discretion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
          <p className="text-gray-700">
            You are responsible for the content you publish, ensuring it
            complies with all applicable laws, intellectual property rights, and
            our acceptable use policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Termination</h2>
          <p className="text-gray-700">
            We reserve the right to suspend or terminate your account if you
            violate these Terms or engage in harmful activity on the platform.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
          <p className="text-gray-700">
            DITBlogs is provided “as is” without warranties of any kind. We are
            not liable for any damages arising from your use or inability to use
            the service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms from time to time. Changes will be posted
            on this page with the updated date.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Contact Information</h2>
          <p className="text-gray-700">
            If you have questions about these Terms, contact us at{" "}
            <a href="mailto:legal@dishis.tech" className="text-blue-600">
              legal@dishis.tech
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
