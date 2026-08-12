import type { Metadata } from "next";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: "Wholesale Baby Products — Bulk Orders India | Little Bunnies" },
  description:
    "Partner with Little Bunnies for wholesale & bulk orders of premium baby products in India. Competitive pricing for retailers, distributors & resellers. Contact us for B2B enquiries.",
  alternates: {
    canonical: "https://littlebunnies.co.in/wholesale",
  },
  openGraph: {
    title: "Wholesale Baby Products — Bulk Orders | Little Bunnies",
    description:
      "Partner with Little Bunnies for wholesale & bulk baby product orders in India. B2B pricing for retailers & distributors.",
    url: "https://littlebunnies.co.in/wholesale",
  },
};

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
