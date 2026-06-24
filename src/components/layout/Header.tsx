"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import SearchModal from "./SearchModal";
import CartDrawer from "@/components/cart/CartDrawer";

const CATEGORIES = [
  {
    label: "Stroller",
    slug: "prams",
    sub: ["Strollers", "Prams", "Travel Systems", "Accessories"],
  },
  {
    label: "Diaper Bags",
    slug: "diapers",
    sub: ["Newborn", "Size 1-2", "Pull-ups", "Wipes"],
  },
  {
    label: "Utility Bags",
    slug: "bags",
    sub: ["Diaper Bags", "Tote Bags", "Backpacks", "Travel Bags"],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on route change
  useEffect(() => {
    setActiveCategory(null);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top announcement bar — Framer Motion animated marquee */}
      <div className="relative w-full h-10 md:h-12 overflow-hidden bg-cream flex items-center justify-center">
        <div className="w-full bg-peach text-ink shadow-soft overflow-hidden py-2 md:py-2.5 z-10 border-y border-ink/5">
          <motion.div
            className="flex whitespace-nowrap w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center w-max">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="flex items-center gap-5 px-3 text-[11px] sm:text-xs font-black tracking-widest uppercase">
                    <span>Free shipping on orders above ₹599</span>
                    <span className="text-ink/40">✦</span>
                    <span>COD Available</span>
                    <span className="text-ink/40">✦</span>
                    <span>Premium baby essentials</span>
                    <span className="text-ink/40">✦</span>
                    <span>Handpicked with love</span>
                    <span className="text-ink/40">✦</span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-cream/95 backdrop-blur-md shadow-soft border-b border-ink/5"
            : "bg-cream"
        )}
      >
        {/* Main header */}
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Mobile: Hamburger */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="btn-ghost p-2.5 rounded-xl"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mx-auto md:mx-0">
              <Image
                src="/images/logo.png"
                alt="Little Bunnies"
                width={260}
                height={88}
                className="h-16 w-auto md:h-20 lg:h-24 transition-all"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" ref={megaRef}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => setActiveCategory(cat.slug)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
                      "hover:bg-cream-dark hover:text-ink",
                      activeCategory === cat.slug && "bg-cream-dark"
                    )}
                  >
                    {cat.label}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        activeCategory === cat.slug && "rotate-180"
                      )}
                    />
                  </Link>

                  {/* Mega dropdown */}
                  <AnimatePresence>
                    {activeCategory === cat.slug && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white rounded-brand shadow-soft-lg border border-ink/5 py-2 z-50"
                      >
                        {cat.sub.map((sub) => (
                          <Link
                            key={sub}
                            href={`/products?category=${cat.slug}&sub=${sub.toLowerCase()}`}
                            className="block px-4 py-2 text-sm text-ink-light hover:text-ink hover:bg-cream transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                        <div className="border-t border-ink/5 mt-2 pt-2">
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className="block px-4 py-2 text-sm font-semibold text-ink hover:bg-cream transition-colors"
                          >
                            View All {cat.label} →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <Link
                href="/about"
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-cream-dark hover:text-ink"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-cream-dark hover:text-ink"
              >
                Contact Us
              </Link>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost p-2.5 rounded-xl"
                aria-label="Search"
              >
                <Search size={20} />
              </button>


              <button
                onClick={openCart}
                className="btn-ghost p-2.5 rounded-xl relative"
                aria-label={`Cart (${cartCount})`}
              >
                <ShoppingBag size={20} />
                {mounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-ink text-cream text-[10px] font-bold flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} categories={CATEGORIES} />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
