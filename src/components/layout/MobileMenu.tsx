"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Phone, Mail } from "lucide-react";

interface Category {
  label: string;
  slug: string;
  sub: string[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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
              <div className="mt-6">
                <p className="text-xs text-ink-muted font-semibold uppercase tracking-widest px-3 mb-3">
                  Categories
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cream-dark font-medium text-ink transition-colors"
                    >
                      {cat.label}
                      <ChevronRight size={16} className="text-ink-muted" />
                    </Link>
                  ))}
                </div>
              </div>

            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-ink/8 bg-cream-dark">
              <p className="text-xs text-ink-muted mb-3 font-medium">Need help?</p>
              <a
                href="https://wa.me/919725252421"
                className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-sage-dark transition-colors"
              >
                <Phone size={16} />
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
