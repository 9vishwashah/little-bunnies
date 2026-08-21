import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Page Not Found | Little Bunnies",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream">
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-20 md:py-28">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Search size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">404</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-ink mb-4">
            We couldn&apos;t find that page
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-xl mx-auto font-medium mb-10">
            The page you're looking for may have moved or no longer exists. Let's get you back to shopping.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 bg-peach hover:bg-peach-dark text-white px-6 py-3.5 rounded-pill font-bold transition-all shadow-soft hover:shadow-soft-lg hover:-translate-y-1"
            >
              <span>Browse All Products</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-ink px-6 py-3.5 rounded-pill font-bold transition-all shadow-soft hover:shadow-soft-lg border border-ink/10"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
