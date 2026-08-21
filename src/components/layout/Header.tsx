"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Menu,
  ChevronDown,
  Heart,
  Search,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import SearchModal from "./SearchModal";
import CartDrawer from "@/components/cart/CartDrawer";

// ─── Fixed top-level nav items ───────────────────────────────────────────────
// The slug must match the category slug you create in the admin panel.
// Sub-categories created under these parents will appear in the dropdown.
// dropdownEnabled: if false, clicking the label navigates directly to the
//   category page without opening any sub-menu popup.
const FIXED_NAV: { label: string; slug: string; dropdownEnabled: boolean }[] = [
  { label: "Prams",     slug: "prams",     dropdownEnabled: true  },
  { label: "Diaper Bags", slug: "bags",    dropdownEnabled: false },
  { label: "Utilities", slug: "utility-bags", dropdownEnabled: false },
];

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

// Map from parent slug → array of sub-category objects
type SubMap = Record<string, SubCategory[]>;

// For MobileMenu prop shape
interface NavCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  children: NavCategory[];
}

export default function Header() {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [scrolled, setScrolled]           = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [subMap, setSubMap]               = useState<SubMap>({});
  const pathname  = usePathname();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const openCart  = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const megaRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch all active categories from DB and map children to their parent slug ──
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: SubCategory[]) => {
        if (!Array.isArray(data)) return;

        // Build id → slug lookup for parents
        const idToSlug: Record<string, string> = {};
        data.forEach((c) => { if (!c.parent_id) idToSlug[c.id] = c.slug; });

        // Group children by their parent's slug
        const map: SubMap = {};
        data.forEach((c) => {
          if (c.parent_id) {
            const parentSlug = idToSlug[c.parent_id];
            if (parentSlug) {
              if (!map[parentSlug]) map[parentSlug] = [];
              map[parentSlug].push(c);
            }
          }
        });
        setSubMap(map);
      })
      .catch(() => {/* silently fail */});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveCategory(null);
    setMobileOpen(false);
  }, [pathname]);

  // Build the shape MobileMenu expects
  const mobileCategories: NavCategory[] = FIXED_NAV.map((nav) => ({
    id: nav.slug,
    name: nav.label,
    slug: nav.slug,
    parent_id: null,
    children: (subMap[nav.slug] ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      parent_id: s.parent_id,
      children: [],
    })),
  }));

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="relative w-full h-10 md:h-12 overflow-hidden bg-cream flex items-center justify-center">
        <div className="w-full bg-peach text-ink shadow-soft overflow-hidden py-2 md:py-2.5 z-10 border-y border-ink/5">
          {mounted ? (
            <motion.div
              className="flex whitespace-nowrap w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 100, ease: "linear" } }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center w-max">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="flex items-center gap-5 px-3 text-[11px] sm:text-xs font-black tracking-widest uppercase">
                      <span className="text-sage-dark">🎉 We Are Live!</span>
                      <span className="text-ink/40">✦</span>
                      <span className="text-ink">Free shipping on orders above ₹5999</span>
                      <span className="text-ink/40">✦</span>
                      <span className="text-blush-dark">Luxury Baby Gears</span>
                      <span className="text-ink/40">✦</span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-5 px-3 text-[11px] sm:text-xs font-black tracking-widest uppercase">
              <span className="text-sage-dark">🎉 We Are Live!</span>
              <span className="text-ink/40">✦</span>
              <span className="text-ink">Free shipping on orders above ₹5999</span>
              <span className="text-ink/40">✦</span>
              <span className="text-blush-dark">Luxury Baby Gears</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky header ── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-cream/95 backdrop-blur-md shadow-soft border-b border-ink/5"
            : "bg-cream"
        )}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-20 md:h-28">

            {/* Left section: Hamburger (Mobile) + Nav (Desktop) */}
            <div className="flex-1 flex items-center justify-start">
              {/* Mobile hamburger */}
              <div className="flex items-center gap-1 md:hidden">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="btn-ghost p-2.5 rounded-xl"
                  aria-label="Open menu"
                >
                  <Menu size={22} />
                </button>
              </div>

              {/* ── Desktop nav ── */}
              <nav className="hidden md:flex items-center gap-1" ref={megaRef}>
                {/* Only render after mount to avoid SSR/client structure mismatch */}
                {mounted && FIXED_NAV.map((nav) => {
                  const subs = subMap[nav.slug] ?? [];

                  // ── Direct-link items (Bags, Utilities) ─────────────────
                  if (!nav.dropdownEnabled) {
                    return (
                      <Link
                        key={nav.slug}
                        href={`/products?category=${nav.slug}`}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-cream-dark hover:text-ink"
                      >
                        {nav.label}
                      </Link>
                    );
                  }

                  // ── Dropdown items (Prams only) ──────────────────────────
                  return (
                    <div
                      key={nav.slug}
                      className="relative"
                      onMouseEnter={() => setActiveCategory(nav.slug)}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      {/* Top-level label */}
                      <Link
                        href={`/products?category=${nav.slug}`}
                        className={cn(
                          "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
                          "hover:bg-cream-dark hover:text-ink",
                          activeCategory === nav.slug && "bg-cream-dark"
                        )}
                      >
                        {nav.label}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            activeCategory === nav.slug && "rotate-180"
                          )}
                        />
                      </Link>

                      {/* Dropdown — shows DB sub-categories + "View All" */}
                      <AnimatePresence>
                        {activeCategory === nav.slug && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 w-56 bg-white rounded-brand shadow-soft-lg border border-ink/5 py-2 z-50"
                          >
                            {nav.slug === "prams" && (
                              <div className="border-b border-ink/5 pb-2 mb-1">
                                <Link
                                  href="/product/little-bunnies-comfy-rider-pro-baby-stroller-360-rotating-reversible-seat-ultra-lightweight-aluminium-frame-upf-50-canopy-one-touch-fold-travel-friendly"
                                  className="block px-4 py-2 text-xs font-bold text-peach-dark hover:bg-cream transition-colors"
                                >
                                  ★ Comfy Rider Pro (Featured)
                                </Link>
                              </div>
                            )}
                            {subs.length > 0 ? (
                              <>
                                {subs.map((sub) => (
                                  <Link
                                    key={sub.slug}
                                    href={`/products?category=${sub.slug}`}
                                    className="block px-4 py-2 text-sm text-ink-light hover:text-ink hover:bg-cream transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                                <div className="border-t border-ink/5 mt-2 pt-2">
                                  <Link
                                    href={`/products?category=${nav.slug}`}
                                    className="block px-4 py-2 text-sm font-semibold text-ink hover:bg-cream transition-colors"
                                  >
                                    View All {nav.label} →
                                  </Link>
                                </div>
                              </>
                            ) : (
                              <Link
                                href={`/products?category=${nav.slug}`}
                                className="block px-4 py-2 text-sm font-semibold text-ink hover:bg-cream transition-colors"
                              >
                                View All {nav.label} →
                              </Link>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

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
            </div>

            {/* Center section: Logo */}
            <div className="flex-shrink-0 flex items-center justify-center mx-1 md:mx-4">
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="Little Bunnies"
                  width={340}
                  height={115}
                  className="h-20 w-auto md:h-24 lg:h-32 transition-all scale-[1.55] md:scale-100 origin-center"
                  priority
                />
              </Link>
            </div>

            {/* Right section: Icons */}
            <div className="flex-1 flex items-center justify-end gap-0 md:gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost p-1.5 md:p-2.5 rounded-xl flex items-center gap-1.5 text-ink-muted hover:text-ink"
                aria-label="Search products"
              >
                <Search size={20} />
                <span className="hidden md:inline text-xs font-semibold bg-cream-dark px-2.5 py-1 rounded-lg">
                  Search...
                </span>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="btn-ghost p-1.5 md:p-2.5 rounded-xl relative"
                aria-label={`Wishlist (${wishlistCount})`}
              >
                <Heart size={20} />
                {mounted && wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </motion.span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="btn-ghost p-1.5 md:p-2.5 rounded-xl relative"
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

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} categories={mobileCategories} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
