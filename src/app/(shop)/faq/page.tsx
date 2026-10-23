import type { Metadata } from "next";
import { SITE_URL, jsonLd, buildFAQSchema, buildBreadcrumbSchema } from "@/lib/seo";
import { FAQ_PAGE_CATEGORIES } from "@/lib/seoContent";
import FAQClient from "./FAQClient";

const PAGE_TITLE = "FAQs: Baby Strollers, Shipping & Exchanges | Little Bunnies";
const PAGE_DESCRIPTION =
  "Answers about Little Bunnies baby strollers, prams & diaper bags — delivery and shipping, exchanges and credit notes, payments and product details.";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/faq`,
    images: [
      {
        url: `${SITE_URL}/images/og/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Little Bunnies FAQ",
      },
    ],
  },
};

export default function FAQPage() {
  // Same data object drives the visible accordion (FAQClient) and this schema,
  // so the structured data can never drift from what visitors can read.
  const faqSchema = jsonLd(buildFAQSchema(FAQ_PAGE_CATEGORIES.flatMap((c) => c.items)));
  const breadcrumbSchema = jsonLd(
    buildBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "FAQs", url: `${SITE_URL}/faq` },
    ])
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <FAQClient categories={FAQ_PAGE_CATEGORIES} />
    </>
  );
}
