import type { Metadata } from "next";

// A customer self-service tool, not a landing page — keep it out of search
// results (crawlable, so Google can see this noindex).
export const metadata: Metadata = {
  title: "Request an Exchange",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://littlebunnies.co.in/exchange-request" },
};

export default function ExchangeRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
