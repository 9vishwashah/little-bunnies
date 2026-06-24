"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  badge?: string;
  scrollable?: boolean;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  badge,
  scrollable = true,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="section-spacing">
      <div className="section-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            {badge && (
              <p className="text-xs font-semibold text-sage-dark uppercase tracking-widest mb-2">
                {badge}
              </p>
            )}
            <h2 className="font-display text-2xl md:text-3xl xl:text-4xl font-bold text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="text-ink-muted text-sm md:text-base mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {scrollable && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-xl bg-cream-dark hover:bg-sky-brand transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-xl bg-cream-dark hover:bg-sky-brand transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            <Link
              href={viewAllHref}
              className="text-sm font-semibold text-ink-muted hover:text-ink transition-colors ml-1"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Scrollable row */}
        {scrollable ? (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
            >
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-[180px] xs:w-[200px] md:w-[220px]"
                >
                  <ProductCard product={product} priority={i < 2} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid layout */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} priority={i < 4} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
