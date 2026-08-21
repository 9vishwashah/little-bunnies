import type { Metadata } from "next";
import { jsonLd, buildFAQSchema } from "@/lib/seo";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: "FAQ — Frequently Asked Questions | Little Bunnies Baby Products" },
  description:
    "Find answers to common questions about Little Bunnies — delivery times, return policy, payment methods, product safety, and more. Baby products for 0–6 months.",
  alternates: {
    canonical: "https://littlebunnies.co.in/faq",
  },
  openGraph: {
    title: "FAQ — Little Bunnies | Baby Products Help Centre",
    description:
      "Answers to common questions about delivery, returns, payments, and baby product safety at Little Bunnies.",
    url: "https://littlebunnies.co.in/faq",
    images: [
      {
        url: "https://littlebunnies.co.in/images/banner2.png",
        width: 1200,
        height: 630,
        alt: "Little Bunnies FAQ",
      },
    ],
  },
};

const faqJsonLdItems = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 7–15 business days. Most orders arrive within 7–10 days. We process orders placed before 12 PM IST on the same business day.",
  },
  {
    question: "Is there free shipping?",
    answer:
      "Yes! We offer free shipping on all orders above ₹5999. Orders below ₹5999 have a flat shipping fee of ₹79.",
  },
  {
    question: "What is the return window?",
    answer:
      "You have 15 days from the date of delivery to initiate a return for eligible products.",
  },
  {
    question: "Are your products safe for newborns?",
    answer:
      "Absolutely! All Little Bunnies products are curated specifically for babies aged 0–6 months and comply with applicable Indian safety standards.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and wallets (Paytm, PhonePe, Google Pay).",
  },
  {
    question: "Are your prams easy to assemble?",
    answer:
      "Yes! All our prams come with detailed assembly guides and video tutorial links. Most can be assembled in under 10 minutes.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Gift wrapping is available for select products. You can add a gift message at checkout. A small gift-wrap fee applies.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Refunds are processed within 5–7 business days after successful quality check. UPI/Net Banking refunds take 3–5 days; card refunds take 5–7 days.",
  },
];

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildFAQSchema(faqJsonLdItems)) }}
      />
      <FAQClient />
    </>
  );
}
