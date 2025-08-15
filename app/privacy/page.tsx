import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Privacy Policy — DITBlogs | DishIs Technologies";
  const description =
    "Read the Privacy Policy for DITBlogs by DishIs Technologies. Learn how we collect, use, and protect your personal data while using our blogging platform.";

  return {
    title,
    description,
    keywords: [
      "DITBlogs Privacy Policy",
      "DITBlogs data protection",
      "DishIs Technologies privacy",
      "blogging platform privacy",
    ],
    openGraph: {
      title,
      description,
      siteName: "DishIs Technologies",
    },
  };
}

export default async function PrivacyPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DITBlogs Privacy Policy",
    description:
      "Privacy Policy for DITBlogs, the blogging platform by DishIs Technologies.",
    url: "https://dishis.tech/privacy",
    publisher: {
      "@type": "Organization",
      name: "DishIs Technologies",
      url: "https://dishis.tech",
      logo: "https://dishis.tech/logo.png",
    },
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-gray-700">
            This Privacy Policy explains how DishIs Technologies collects, uses,
            and protects your information when you use DITBlogs. By using our
            platform, you agree to this policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Personal details such as name, email address, and profile data.</li>
            <li>Content you publish, including posts, media, and comments.</li>
            <li>
              Technical data like IP address, browser type, and device
              information.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>To operate and improve DITBlogs.</li>
            <li>To communicate updates, support, and promotions.</li>
            <li>To prevent fraud and ensure security.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
          <p className="text-gray-700">
            We do not sell your personal information. We may share data with
            trusted service providers, affiliates, or when required by law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Cookies & Tracking</h2>
          <p className="text-gray-700">
            We use cookies and similar tracking technologies to enhance your
            experience, analyze traffic, and improve our services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
          <p className="text-gray-700">
            We retain your personal data only as long as necessary to fulfill
            the purposes described in this policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Access, update, or delete your personal data.</li>
            <li>Request a copy of the data we hold about you.</li>
            <li>Opt-out of marketing communications.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            8. Security of Your Data
          </h2>
          <p className="text-gray-700">
            We implement industry-standard security measures to protect your
            information from unauthorized access or disclosure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. Significant
            changes will be communicated on this page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
          <p className="text-gray-700">
            For privacy-related questions, email us at{" "}
            <a href="mailto:privacy@dishis.tech" className="text-blue-600">
              privacy@dishis.tech
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
