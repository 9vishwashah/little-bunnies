"use client";

import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Clock } from "lucide-react";


const posts = [
  {
    category: "Baby Care",
    tag: "Guide",
    color: "bg-sage-light text-sage-dark",
    date: "June 15, 2026",
    readTime: "5 min read",
    title: "Essential Baby Care Tips for New Parents",
    excerpt:
      "Navigating the first weeks with a newborn can feel overwhelming. We share practical, pediatrician-approved tips to help you care for your little one with confidence.",
    slug: "essential-baby-care-tips",
  },
  {
    category: "Product Guide",
    tag: "Review",
    color: "bg-sky-brand text-ink-light",
    date: "June 8, 2026",
    readTime: "7 min read",
    title: "How to Choose the Right Pram for Your Baby",
    excerpt:
      "With hundreds of options on the market, picking the right pram can be daunting. Learn what features matter most for safety, comfort, and convenience.",
    slug: "choose-right-pram",
  },
  {
    category: "Nutrition",
    tag: "Tips",
    color: "bg-peach-light text-peach-dark",
    date: "May 30, 2026",
    readTime: "4 min read",
    title: "Breastfeeding vs. Formula: A Balanced Look",
    excerpt:
      "We explore the pros and cons of breastfeeding and formula feeding, helping you make the best decision for your family without guilt or judgment.",
    slug: "breastfeeding-vs-formula",
  },
  {
    category: "Sleep",
    tag: "Expert",
    color: "bg-lavender-brand-light text-lavender-brand-dark",
    date: "May 22, 2026",
    readTime: "6 min read",
    title: "Creating a Safe Sleep Environment for Your Newborn",
    excerpt:
      "Safe sleep practices can significantly reduce risks for newborns. Here's everything you need to know about setting up a safe and comfortable sleep space.",
    slug: "safe-sleep-environment",
  },
  {
    category: "Development",
    tag: "Milestone",
    color: "bg-blush-light text-blush-dark",
    date: "May 15, 2026",
    readTime: "5 min read",
    title: "Baby Development Milestones: 0–6 Months",
    excerpt:
      "Every baby develops at their own pace, but there are general milestones to watch for. Discover what to expect in your baby's exciting first six months.",
    slug: "baby-development-milestones",
  },
  {
    category: "Diapering",
    tag: "How-To",
    color: "bg-cream-darker text-ink-muted",
    date: "May 5, 2026",
    readTime: "3 min read",
    title: "Diaper Rash Prevention & Treatment Guide",
    excerpt:
      "Diaper rash is common but preventable. Learn the best practices for keeping your baby's skin healthy, and how to treat rashes when they occur.",
    slug: "diaper-rash-guide",
  },
];

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-peach-light via-cream to-sage-light py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <BookOpen size={14} className="text-peach-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">The Little Bunnies Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Parenting Tips &amp; Guides
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Expert advice, product guides, and heartfelt stories to support your journey through the wonderful first months of parenthood.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="section-container py-10 md:py-16">
        <div className="bg-ink rounded-brand overflow-hidden md:grid md:grid-cols-5">
          <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center text-cream">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-pill text-xs font-bold ${featured.color}`}>{featured.category}</span>
              <span className="text-cream/40 text-xs">{featured.tag}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 leading-snug">
              {featured.title}
            </h2>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-cream/40 text-xs mb-6">
              <span className="flex items-center gap-1.5"><Calendar size={12} />{featured.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} />{featured.readTime}</span>
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="inline-flex items-center gap-2 text-peach font-bold text-sm hover:gap-3 transition-all"
            >
              Read Article <ArrowRight size={16} />
            </Link>
          </div>
          <div className="md:col-span-2 bg-gradient-to-br from-peach-light to-sage-light min-h-48 md:min-h-0 flex items-center justify-center">
            <BookOpen size={80} className="text-white/30" />
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="section-container pb-16 md:pb-24">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-8">Latest Articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <article key={post.slug} className="bg-white rounded-brand shadow-card overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-card-hover">
              <div className="aspect-video bg-gradient-to-br from-cream to-cream-dark flex items-center justify-center">
                <BookOpen size={40} className="text-ink/10" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-pill text-xs font-bold ${post.color}`}>{post.category}</span>
                </div>
                <h3 className="font-display font-bold text-ink text-lg leading-snug mb-2 group-hover:text-peach-dark transition-colors">
                  {post.title}
                </h3>
                <p className="text-ink-muted text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1"><Calendar size={11} />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-container pb-16 md:pb-24">
        <div className="bg-gradient-to-r from-peach-light to-sage-light rounded-brand p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-3">
            Never Miss a Post
          </h2>
          <p className="text-ink-muted mb-6 max-w-md mx-auto text-sm">
            Subscribe to get our latest parenting tips and exclusive Little Bunnies content delivered to your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="input-brand flex-1"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
