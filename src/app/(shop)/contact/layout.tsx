import type { Metadata } from "next";
import { jsonLd, buildLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: "Contact Little Bunnies — Customer Support & WhatsApp | Baby Products India" },
  description:
    "Contact Little Bunnies for support, order queries, returns & wholesale enquiries. Reach us via WhatsApp at +91 89760 77070, email, or our contact form. Available Mon–Sat 10 AM–6 PM IST.",
  alternates: {
    canonical: "https://littlebunnies.co.in/contact",
  },
  openGraph: {
    title: "Contact Little Bunnies — Customer Support",
    description:
      "Get in touch with Little Bunnies via WhatsApp, email, or our contact form. Available Mon–Sat 10 AM–6 PM IST.",
    url: "https://littlebunnies.co.in/contact",
    images: [
      {
        url: "https://littlebunnies.co.in/images/LittleBunnies-Banner.png",
        width: 1200,
        height: 630,
        alt: "Contact Little Bunnies",
      },
    ],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* LocalBusiness schema with contact details for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildLocalBusinessSchema()) }}
      />
      {children}
    </>
  );
}
