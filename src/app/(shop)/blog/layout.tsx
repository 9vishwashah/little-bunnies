import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Expert parenting tips, baby care guides, product reviews, and newborn advice from the Little Bunnies team.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
