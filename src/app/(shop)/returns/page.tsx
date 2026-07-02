import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Read Little Bunnies' Return & Refund Policy — our rules regarding cancellations and returns.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <RefreshCw size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Read Little Bunnies' Return & Refund Policy — our rules regarding cancellations and returns.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-10 pb-20">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-8 md:p-12">
          <div className="prose prose-stone prose-headings:font-display prose-headings:text-ink prose-p:text-ink-light prose-li:text-ink-light prose-a:text-sage-dark hover:prose-a:text-ink max-w-none">
            <p>{`At Little Bunnies (Little Bunnies), orders once placed cannot be cancelled and no refunds shall be issued. We prioritize order processing on time and therefore all orders are forwarded to the production team as soon as they are received`}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
