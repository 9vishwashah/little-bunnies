"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid2X2,
  LayoutGrid,
  X,
  Search,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product, Category } from "@/types";
import { cn, formatPrice } from "@/lib/utils";



const PRICE_RANGES = [
  { label: "Below ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { label: "Above ₹20,000", min: 20000, max: 999999 },
];

interface ProductsClientProps {
  initialProducts: Product[];
  totalCount: number;
  categories: Category[];
  searchParams: Record<string, string>;
}

export default function ProductsClient({
  initialProducts,
  totalCount,
  categories,
  searchParams,
}: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [gridCols, setGridCols] = useState<2 | 4>(2);
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");
  const [previewResults, setPreviewResults] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localSearch.trim() || localSearch.trim().length < 2) {
      setPreviewResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(localSearch.trim())}&limit=5`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setPreviewResults(data);
        }
      } catch {
        setPreviewResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [localSearch]);

  // Click outside to close preview dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowPreview(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPage = parseInt(searchParams.page || "1");
  const totalPages = Math.ceil(totalCount / 24);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", localSearch);
  };

  const activeFilters = Object.entries(searchParams).filter(
    ([k]) => !["page", "sort"].includes(k)
  );

  // Real crawlable hrefs for pagination — Googlebot discovers subsequent
  // pages via <a href>, it doesn't execute onClick handlers.
  const buildPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!searchParams.category}
              onChange={() => updateFilter("category", null)}
              className="accent-ink"
            />
            <span className="text-sm font-medium text-ink-light">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={searchParams.category === cat.slug}
                onChange={() => updateFilter("category", cat.slug)}
                className="accent-ink"
              />
              <span className="text-sm font-medium text-ink-light">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Price Range</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={!searchParams.minPrice && !searchParams.maxPrice}
              onChange={() => {
                updateFilter("minPrice", null);
                updateFilter("maxPrice", null);
              }}
              className="accent-ink"
            />
            <span className="text-sm font-medium text-ink-light">All Prices</span>
          </label>
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={
                  searchParams.minPrice === String(range.min) &&
                  searchParams.maxPrice === String(range.max)
                }
                onChange={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("minPrice", String(range.min));
                  params.set("maxPrice", String(range.max));
                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="accent-ink"
              />
              <span className="text-sm font-medium text-ink-light">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Availability</h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.inStock === "true"}
            onChange={(e) =>
              updateFilter("inStock", e.target.checked ? "true" : null)
            }
            className="accent-ink rounded"
          />
          <span className="text-sm font-medium text-ink-light">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="section-container py-3 md:py-5">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          {searchParams.search
            ? `Results for "${searchParams.search}"`
            : searchParams.category
            ? categories.find((c) => c.slug === searchParams.category)?.name || "Products"
            : "All Products"}
        </h1>
        <p className="text-ink-muted text-sm mt-1 font-medium">
          {totalCount} {totalCount === 1 ? "product" : "products"} found
        </p>
      </div>

      {/* Search bar with matching product preview */}
      <div ref={searchContainerRef} className="relative w-full max-w-xl mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-brand border border-ink/8 px-4 py-2.5 shadow-soft focus-within:border-ink/20">
            <Search size={18} className="text-ink-muted flex-shrink-0" />
            <input
              type="text"
              value={localSearch}
              onFocus={() => setShowPreview(true)}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setShowPreview(true);
              }}
              placeholder="Search products by name or brand..."
              className="flex-1 bg-transparent text-sm md:text-base text-ink placeholder-ink-muted outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  setPreviewResults([]);
                }}
                className="p-1 hover:bg-cream rounded-full"
              >
                <X size={14} className="text-ink-muted" />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary px-5 py-2.5 text-sm md:text-base font-semibold">
            Search
          </button>
        </form>

        {/* Live Matching Product Preview Dropdown */}
        <AnimatePresence>
          {showPreview && localSearch.trim().length >= 2 && previewResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-brand shadow-soft-xl border border-ink/8 p-3 z-50 max-h-[70vh] overflow-y-auto"
            >
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-2 pb-2 mb-2 border-b border-ink/5">
                Matching Product Previews ({previewResults.length})
              </div>
              <div className="space-y-1.5">
                {previewResults.map((item) => {
                  const primaryImg =
                    item.product_images?.find((img: any) => img.is_primary) ||
                    item.product_images?.[0];
                  const imgUrl =
                    primaryImg?.url || "/images/banner2.png";

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
                      onClick={() => setShowPreview(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-cream-dark transition-all group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                        <Image
                          src={imgUrl}
                          alt={displayName}
                          fill
                          sizes="48px"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">

          {/* Active filter chips */}
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <button
                key={key}
                onClick={() => updateFilter(key, null)}
                className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-pill bg-sky-brand text-ink text-xs font-semibold active:scale-95 transition-transform"
              >
                {key}: {value}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Grid toggle (desktop only) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-cream-dark">
            <button
              onClick={() => setGridCols(4)}
              className={cn(
                "p-2 rounded-lg transition-all active:scale-95",
                gridCols === 4 ? "bg-white shadow-soft-sm" : "hover:bg-cream"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setGridCols(2)}
              className={cn(
                "p-2 rounded-lg transition-all active:scale-95",
                gridCols === 2 ? "bg-white shadow-soft-sm" : "hover:bg-cream"
              )}
            >
              <Grid2X2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {initialProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🐰</div>
              <h3 className="font-display font-semibold text-ink text-xl mb-2">
                No products found
              </h3>
              <p className="text-ink-muted font-medium mb-4">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={() => router.push(pathname)}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className={cn(
                "grid gap-3 md:gap-4",
                gridCols === 4
                  ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-2 xl:grid-cols-3"
              )}
            >
              <AnimatePresence>
                {initialProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.4) }}
                    layout
                  >
                    <ProductCard product={product} priority={i < 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={buildPageHref(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={cn(
                    "w-11 h-11 flex items-center justify-center rounded-xl text-sm font-semibold transition-all active:scale-95",
                    page === currentPage
                      ? "bg-ink text-cream"
                      : "bg-cream-dark text-ink hover:bg-sky-brand"
                  )}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
