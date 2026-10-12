import type { Metadata } from "next";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: "Careers & Jobs at Little Bunnies — Work With Us | Baby Brand India" },
  description:
    "Join the Little Bunnies team! We're hiring passionate people to help build India's premier baby products brand. Explore careers and apply online.",
  alternates: {
    canonical: "https://littlebunnies.co.in/work-for-us",
  },
  openGraph: {
    title: "Careers at Little Bunnies — Work With Us",
    description:
      "Join the Little Bunnies team and help build India's premier baby products brand. Explore career opportunities today.",
    url: "https://littlebunnies.co.in/work-for-us",
  },
};

export default function WorkForUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
