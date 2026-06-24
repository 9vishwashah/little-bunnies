"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Grid2X2,
  LayoutGrid,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product, Category } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_seller", label: "Best Sellers" },
];

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 4>(2);
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");

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

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 md:hidden">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-brand border border-ink/8 px-4 py-2.5">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-sm text-ink placeholder-ink-muted outline-none"
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2.5 text-sm">
          Search
        </button>
      </form>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ink/8 text-sm font-semibold text-ink hover:bg-cream-dark transition-colors md:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-ink text-cream text-xs font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Active filter chips */}
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <button
                key={key}
                onClick={() => updateFilter(key, null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-sky-brand text-ink text-xs font-semibold"
              >
                {key}: {value}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Sort */}
          <div className="relative">
            <select
              value={searchParams.sort || "featured"}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="appearance-none bg-white border border-ink/8 rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-ink cursor-pointer outline-none hover:bg-cream-dark transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
          </div>

          {/* Grid toggle (desktop only) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-cream-dark">
            <button
              onClick={() => setGridCols(4)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                gridCols === 4 ? "bg-white shadow-soft-sm" : "hover:bg-cream"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setGridCols(2)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                gridCols === 2 ? "bg-white shadow-soft-sm" : "hover:bg-cream"
              )}
            >
              <Grid2X2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="bg-white rounded-brand p-5 shadow-card sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-ink">Filters</h2>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => router.push(pathname)}
                  className="text-xs text-ink-muted hover:text-ink transition-colors font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

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
                <button
                  key={page}
                  onClick={() => updateFilter("page", String(page))}
                  className={cn(
                    "w-10 h-10 rounded-xl text-sm font-semibold transition-colors",
                    page === currentPage
                      ? "bg-ink text-cream"
                      : "bg-cream-dark text-ink hover:bg-sky-brand"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-[2rem] z-[90] max-h-[85vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-semibold text-ink text-xl">Filters</h2>
                  <button onClick={() => setFilterOpen(false)}>
                    <X size={22} />
                  </button>
                </div>
                <FilterContent />
                <div className="flex gap-3 mt-6 pt-4 border-t border-ink/8">
                  <button
                    onClick={() => {
                      router.push(pathname);
                      setFilterOpen(false);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="btn-primary flex-1"
                  >
                    Show Results ({totalCount})
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
