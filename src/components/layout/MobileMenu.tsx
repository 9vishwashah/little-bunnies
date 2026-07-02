"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronDown } from "lucide-react";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  children: NavCategory[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: NavCategory[];
}

export default function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset expanded when menu closes
  useEffect(() => {
    if (!isOpen) setExpanded(null);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-cream z-[70] flex flex-col overflow-y-auto safe-top safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/8">
              <div>
                <p className="text-xs text-ink-muted font-medium uppercase tracking-widest">Menu</p>
                <p className="font-display font-semibold text-ink text-lg">Little Bunnies</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-cream-dark transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4">
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-semibold text-ink transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-semibold text-ink transition-colors"
                >
                  All Products
                  <ChevronRight size={16} className="text-ink-muted" />
                </Link>
                <Link
                  href="/about"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-semibold text-ink transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-semibold text-ink transition-colors"
                >
                  Contact Us
                </Link>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-ink-muted font-semibold uppercase tracking-widest px-3 mb-3">
                    Categories
                  </p>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <div key={cat.slug}>
                        {cat.children.length > 0 ? (
                          <>
                            {/* Accordion toggle for categories with children */}
                            <button
                              onClick={() => setExpanded(expanded === cat.slug ? null : cat.slug)}
                              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-medium text-ink transition-colors"
                            >
                              {cat.name}
                              <ChevronDown
                                size={16}
                                className={`text-ink-muted transition-transform duration-200 ${expanded === cat.slug ? "rotate-180" : ""}`}
                              />
                            </button>
                            <AnimatePresence>
                              {expanded === cat.slug && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-4 py-1 space-y-0.5">
                                    {cat.children.map((sub) => (
                                      <Link
                                        key={sub.slug}
                                        href={`/products?category=${sub.slug}`}
                                        onClick={onClose}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-cream-dark text-sm text-ink-light hover:text-ink transition-colors"
                                      >
                                        {sub.name}
                                        <ChevronRight size={14} className="text-ink-muted" />
                                      </Link>
                                    ))}
                                    <Link
                                      href={`/products?category=${cat.slug}`}
                                      onClick={onClose}
                                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-cream-dark text-sm font-semibold text-ink transition-colors"
                                    >
                                      View All {cat.name}
                                      <ChevronRight size={14} className="text-ink-muted" />
                                    </Link>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          /* Direct link for categories without children */
                          <Link
                            href={`/products?category=${cat.slug}`}
                            onClick={onClose}
                            className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-medium text-ink transition-colors"
                          >
                            {cat.name}
                            <ChevronRight size={16} className="text-ink-muted" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-ink/8 bg-cream-dark">
              <p className="text-xs text-ink-muted mb-3 font-medium">Need help?</p>
              <a
                href="https://wa.me/919725252421"
                className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-sage-dark transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
