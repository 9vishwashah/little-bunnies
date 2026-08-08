"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURED_SUGGESTIONS = [
  { label: "★ Comfy Rider Pro Stroller", href: "/product/little-bunnies-comfy-rider-pro-baby-stroller-360-rotating-reversible-seat-ultra-lightweight-aluminium-frame-upf-50-canopy-one-touch-fold-travel-friendly" },
  { label: "Prams & Strollers", href: "/prams-strollers" },
  { label: "Diaper Bags", href: "/products?category=bags" },
  { label: "Baby Feeding Essentials", href: "/products?category=feeding" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Live matching product preview search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}&limit=6`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-cream z-[90] shadow-soft-xl max-h-[85vh] overflow-y-auto"
          >
            <div className="section-container py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={22} className="text-ink-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search prams, strollers, bags..."
                  className="flex-1 bg-transparent text-ink text-lg font-medium placeholder-ink-muted outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 rounded-lg hover:bg-cream-dark transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-cream-dark transition-colors text-sm font-semibold text-ink-muted"
                >
                  Cancel
                </button>
              </form>

              {/* ── Matching Products Preview ── */}
              <div className="mt-4 pt-4 border-t border-ink/5">
                {query.trim().length >= 2 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                        {loading ? "Searching..." : `Matching Products (${results.length})`}
                      </span>
                      {results.length > 0 && (
                        <Link
                          href={`/products?search=${encodeURIComponent(query.trim())}`}
                          onClick={onClose}
                          className="text-xs font-semibold text-peach-dark hover:underline flex items-center gap-1"
                        >
                          View all results →
                        </Link>
                      )}
                    </div>

                    {results.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {results.map((item) => {
                          const primaryImg =
                            item.product_images?.find((img: any) => img.is_primary) ||
                            item.product_images?.[0];
                          const imgUrl =
                            primaryImg?.url || "/images/LittleBunnies-Banner.png";

                          const shortName = item.name.includes(" | ") ? item.name.split(" | ")[0] : item.name;
                          const displayName =
                            item.brand &&
                            item.brand !== "Little Bunnies" &&
                            !shortName.toLowerCase().includes(item.brand.toLowerCase())
                              ? `${item.brand} ${shortName}`
                              : shortName;

                          return (
                            <Link
                              key={item.id}
                              href={`/product/${item.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-3 p-2.5 rounded-2xl bg-white hover:bg-cream-dark transition-all border border-ink/5 hover:shadow-soft group"
                            >
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream flex-shrink-0">
                                <Image
                                  src={imgUrl}
                                  alt={displayName}
                                  fill
                                  sizes="64px"
                                  className="object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-ink truncate group-hover:text-peach-dark transition-colors">
                                  {displayName}
                                </h4>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      !loading && (
                        <div className="text-center py-6">
                          <p className="text-sm text-ink-muted font-medium">
                            No matching products found for &ldquo;{query}&rdquo;.
                          </p>
                          <Link
                            href="/prams-strollers"
                            onClick={onClose}
                            className="inline-block mt-2 text-xs font-bold text-peach-dark hover:underline"
                          >
                            Explore All Prams & Strollers →
                          </Link>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                      <Sparkles size={14} className="text-peach-dark" />
                      <span>Popular Searches & Quick Links</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FEATURED_SUGGESTIONS.map((sug) => (
                        <Link
                          key={sug.label}
                          href={sug.href}
                          onClick={onClose}
                          className="px-3.5 py-1.5 rounded-full bg-white text-xs font-semibold text-ink border border-ink/8 hover:bg-cream-dark hover:border-ink/20 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>{sug.label}</span>
                          <ArrowRight size={12} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
