import { HomeHero } from "@/components/home/home-hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Features } from "@/components/home/features";
import { Works } from "@/components/home/works";
import { Reviews } from "@/components/home/reviews";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { SiteFooter } from "@/components/site-footer";

export default async function HomePage() {
  return (
    <>
      <main className="container mx-auto px-4 py-8 scrollable">
        <HomeHero />
        <HowItWorks />
        <Features />
        <Works />
        <Reviews />
        <NewsletterCta />
      </main>
      <SiteFooter />
    </>
  );
}