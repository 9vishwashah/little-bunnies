"use client";

import { useState, useEffect } from "react";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Info,
  Clock,
  Heart,
  BookOpen,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product, ProductVariant } from "@/types";
import {
  formatPrice,
  calculateDiscount,
  getWhatsAppUrl,
  cn,
} from "@/lib/utils";
import ProductSection from "@/components/home/ProductSection";
import { toast } from "sonner";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>("delivery");
  const [pageUrl, setPageUrl] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<"idle" | "valid" | "invalid">("idle");

  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  let images = product.product_images
    ? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  if (images.length === 0 && product.product_variants) {
    for (const v of product.product_variants) {
      if (v.image_url) {
        try {
          const parsed = JSON.parse(v.image_url);
          if (parsed.gallery && Array.isArray(parsed.gallery) && parsed.gallery.length > 0) {
            images = parsed.gallery.map((url: string, i: number) => ({
              id: `fallback-img-${i}`,
              product_id: product.id,
              url,
              sort_order: i,
              is_primary: i === 0,
            }));
            break;
          }
        } catch (e) {}
      }
    }
  }

  if (selectedVariant?.image_url) {
    try {
      const parsed = JSON.parse(selectedVariant.image_url);
      if (parsed.gallery && Array.isArray(parsed.gallery) && parsed.gallery.length > 0) {
        images = parsed.gallery.map((url: string, i: number) => ({
          id: `variant-img-${i}`,
          product_id: product.id,
          url,
          sort_order: i,
          is_primary: i === 0,
        }));
      }
    } catch (e) {}
  }

  const primaryImage = images[selectedImage] || images[0];
  const discount = calculateDiscount(product.price, product.compare_price || 0);
  const currentPrice = product.price + (selectedVariant?.price_modifier || 0);
  const promoDiscount = promoApplied ? currentPrice * 0.1 : 0;
  const finalPrice = currentPrice - promoDiscount;

  const whatsappUrl = getWhatsAppUrl(product.name, pageUrl);

  // Set page URL and track recently viewed after mount (client-only)
  useEffect(() => {
    setPageUrl(window.location.href);
    addRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage?.url || "/images/placeholder.jpg",
      viewedAt: Date.now(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Auto slide removed — images change only on manual swipe/click

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage?.url || "/images/placeholder.jpg",
      quantity,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            name: selectedVariant.name,
            value: selectedVariant.value,
            price_modifier: selectedVariant.price_modifier,
          }
        : undefined,
    });
    toast.success("Added to cart!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Little Bunnies!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const toggleSection = (key: string) =>
    setExpandedSection(expandedSection === key ? null : key);

  // Group variants by name
  const variantGroups = product.product_variants?.reduce(
    (acc, v) => {
      if (!acc[v.name]) acc[v.name] = [];
      acc[v.name].push(v);
      return acc;
    },
    {} as Record<string, ProductVariant[]>
  ) || {};

  const approvedReviews = product.reviews?.filter((r) => r.is_approved) || [];
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approvedReviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="section-container py-6 md:py-10">
      {/* Breadcrumb — desktop only */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-ink-muted font-medium mb-6">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-ink transition-colors">Products</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.categories.slug}`}
              className="hover:text-ink transition-colors"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink line-clamp-1">{product.name}</span>
      </nav>

      {/* Mobile product title — shown instead of breadcrumb */}
      <div className="md:hidden mb-4">
        {product.brand && (
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">
            {product.brand}
          </p>
        )}
        <h1 className="font-display text-lg font-bold text-ink leading-tight">
          {product.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16">
        {/* ── Gallery ─────────────────────────────── */}
        <div className="relative">
          {/* Main image */}
          <div className="relative aspect-square rounded-brand overflow-hidden bg-cream-dark mb-3 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <ProductImage
                  src={primaryImage?.url || "/images/placeholder.jpg"}
                  alt={primaryImage?.alt || product.name}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {discount > 0 && <span className="badge-sale">{discount}% OFF</span>}
              {product.is_new_arrival && <span className="badge-new">NEW</span>}
            </div>

            {/* Wishlist heart button */}
            <button
              onClick={() => {
                const wasWishlisted = isWishlisted(product.id);
                toggleWishlist(product.id);
                toast.success(
                  wasWishlisted ? "Removed from wishlist" : "Added to wishlist! ❤️"
                );
              }}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Toggle wishlist"
            >
              <Heart
                size={20}
                className={cn(
                  "transition-all duration-200",
                  isWishlisted(product.id)
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-ink/50"
                )}
              />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((i) => (i + 1) % images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>


          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all",
                    i === selectedImage
                      ? "border-ink scale-105"
                      : "border-transparent hover:border-ink/30"
                  )}
                >
                  <ProductImage
                    src={img.url}
                    alt={img.alt || product.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    showSkeleton={false}
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Variants (Moved below image container) */}
          <div className="mt-6 md:mt-8 flex flex-wrap gap-8">
            {Object.entries(variantGroups).map(([groupName, variants]) => (
              <div key={groupName} className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    let swatchUrl = "";
                    if (variant.image_url) {
                      try {
                        const parsed = JSON.parse(variant.image_url);
                        if (parsed.swatch) swatchUrl = parsed.swatch;
                      } catch (e) {}
                    }

                    return (
                    <button
                      key={variant.id}
                      title={variant.value}
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant?.id === variant.id ? null : variant
                        )
                      }
                      className={cn(
                        "transition-all",
                        swatchUrl
                          ? "w-12 h-12 rounded-full border-2 overflow-hidden" // Swatch style
                          : "px-4 py-2 rounded-full border-2 text-sm font-semibold", // Text style
                        selectedVariant?.id === variant.id
                          ? "border-ink scale-110" + (!swatchUrl ? " bg-ink text-cream" : " shadow-md")
                          : "border-ink/15 text-ink hover:border-ink/40" + (!swatchUrl ? "" : " hover:scale-105")
                      )}
                    >
                      {swatchUrl ? (
                        <img src={swatchUrl} alt={variant.value} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          {variant.value}
                          {variant.price_modifier !== 0 && (
                            <span className="text-xs ml-1 opacity-70">
                              ({variant.price_modifier > 0 ? "+" : ""}
                              {formatPrice(variant.price_modifier)})
                            </span>
                          )}
                        </>
                      )}
                    </button>
                    );
                  })}
                </div>
                <p className="font-semibold text-ink text-sm">
                  {groupName}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Product Info ─────────────────────────── */}
        <div>
          {/* Brand — desktop only (mobile brand shown above gallery) */}
          {product.brand && (
            <p className="hidden md:block text-xs font-bold text-ink-muted uppercase tracking-widest mb-2">
              {product.brand}
            </p>
          )}

          {/* Name — desktop only (mobile title shown above gallery) */}
          <h1 className="hidden md:block font-display text-2xl md:text-3xl font-bold text-ink leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          {product.review_count && product.review_count > 0 ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(product.avg_rating || 0)
                        ? "text-peach fill-peach"
                        : "text-ink/20 fill-ink/10"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-ink">
                {product.avg_rating?.toFixed(1)}
              </span>
              <span className="text-sm text-ink-muted font-medium">
                ({product.review_count} reviews)
              </span>
            </div>
          ) : null}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-bold text-ink text-2xl">
              {formatPrice(finalPrice)}
            </span>
            {promoApplied && (
              <span className="text-sm text-ink-muted line-through font-medium">
                {formatPrice(currentPrice)}
              </span>
            )}
            {!promoApplied && product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-ink-muted line-through font-medium">
                {formatPrice(product.compare_price)}
              </span>
            )}
            {discount > 0 && (
              <span className="badge-sale text-sm px-3 py-1.5">{discount}% OFF</span>
            )}
            {promoApplied && (
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                -10% applied
              </span>
            )}
          </div>

          {/* Promo Code */}
          <div className="mb-5">
            {promoApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">🎉</span>
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Promo Applied</p>
                    <p className="text-xs text-green-600 font-medium">FAMILY5 — 10% off</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPromoApplied(false);
                    setPromoInput("");
                    setPromoError("");
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                  placeholder="Enter promo code"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-ink/15 text-sm font-medium bg-cream focus:outline-none focus:border-ink/40 transition-colors placeholder:text-ink-muted/60 uppercase"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (promoInput.trim().toUpperCase() === "FAMILY5") {
                        setPromoApplied(true); setPromoError("");
                      } else {
                        setPromoError("Invalid promo code");
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (promoInput.trim().toUpperCase() === "FAMILY5") {
                      setPromoApplied(true); setPromoError("");
                    } else {
                      setPromoError("Invalid promo code");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-ink text-cream text-sm font-bold hover:bg-ink/80 active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>
            )}
            {promoError && (
              <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{promoError}</p>
            )}
          </div>
          {/* Action button — opens WhatsApp directly */}
          <div className="flex mb-4 w-full">
            <a
              href={(() => {
                const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919725252421";
                const variantLine = selectedVariant ? `\nVariant: ${selectedVariant.name} — ${selectedVariant.value}` : "";
                const promoLine = promoApplied ? `\nPromo Code: FAMILY5 (10% off applied)` : "";
                const msg = `Hi Little Bunnies,\n\nI'd like to Pre-Order:\n\nProduct: ${product.name}${variantLine}\nPrice: ${formatPrice(finalPrice)}${promoLine}\n\n${pageUrl}\n\nKindly share delivery and payment details. Thank you!`;
                return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-sm h-12 max-h-12 bg-peach hover:bg-peach-dark flex items-center justify-center gap-2"
            >
              <Clock size={17} className="flex-shrink-0" />
              <span className="truncate">Pre-Order Now</span>
            </a>
          </div>

          {/* Delivery Pincode */}
          <div className="mb-5 p-4 rounded-xl border border-ink/10 bg-cream-dark/30">
            <p className="text-sm font-bold text-ink mb-0.5">Delivery To</p>
            <p className="text-xs text-ink-muted font-medium mb-3">Enter your pincode to check delivery info</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPincode(val);
                  setPincodeResult("idle");
                }}
                placeholder="Enter Pincode"
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-ink/15 text-sm font-medium bg-white focus:outline-none focus:border-ink/40 transition-colors placeholder:text-ink-muted/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pincode.length === 6) {
                    setPincodeResult("valid");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (pincode.length === 6) {
                    setPincodeResult("valid");
                  } else {
                    setPincodeResult("invalid");
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-peach-dark hover:bg-peach/10 transition-colors"
              >
                CHECK
              </button>
            </div>
            {pincodeResult === "valid" && (
              <p className="text-xs text-green-700 font-semibold mt-2 ml-1">
                Delivery available to {pincode} — estimated 14 business days.
              </p>
            )}
            {pincodeResult === "invalid" && (
              <p className="text-xs text-red-500 font-medium mt-2 ml-1">
                Please enter a valid 6-digit pincode.
              </p>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <>
              {/* Desktop View: No wrapper/accordion */}
              <div className="hidden md:block mb-5 pt-5 border-t border-ink/8">
                <div className="flex items-center gap-2.5 mb-3">
                  <Info size={18} className="text-ink-muted" strokeWidth={1.8} />
                  <span className="font-semibold text-ink text-sm">Key Features</span>
                </div>
                <div
                  className="pb-4 text-ink-light text-sm leading-relaxed font-medium prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              </div>

              {/* Mobile View: Accordion */}
              <div className="block md:hidden border-t border-ink/8">
                <button
                  onClick={() => toggleSection("short_description")}
                  className="flex items-center justify-between w-full py-4 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Info size={18} className="text-ink-muted" strokeWidth={1.8} />
                    <span className="font-semibold text-ink text-sm">Key Features</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-ink-muted transition-transform",
                      expandedSection === "short_description" && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {expandedSection === "short_description" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pb-4 text-ink-light text-sm leading-relaxed font-medium prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.short_description }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── About this Product Accordion ──── */}
      {product.description && (
        <section className="border-t border-ink/8">
          <div className="border-b border-ink/8">
            <button
              onClick={() => toggleSection("about")}
              className="flex items-center justify-between w-full py-4 text-left"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen size={18} className="text-ink-muted" strokeWidth={1.8} />
                <span className="font-semibold text-ink text-sm">About this Product</span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-ink-muted transition-transform",
                  expandedSection === "about" && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSection === "about" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="pb-4 prose prose-sm max-w-none text-ink font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}



      {/* ── Reviews ──────────────────────────────── */}
      {approvedReviews.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-8">
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rating overview */}
            <div className="bg-cream-dark/50 rounded-brand p-6 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-ink mb-1">
                {product.avg_rating?.toFixed(1)}
              </p>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={
                      s <= Math.round(product.avg_rating || 0)
                        ? "text-peach fill-peach"
                        : "text-ink/20"
                    }
                  />
                ))}
              </div>
              <p className="text-ink-muted text-sm font-medium">
                {product.review_count} reviews
              </p>
              <div className="w-full mt-5 space-y-2">
                {ratingBreakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-3">{star}</span>
                    <Star size={12} className="text-peach fill-peach" />
                    <div className="flex-1 h-1.5 rounded-full bg-cream-darker overflow-hidden">
                      <div
                        className="h-full rounded-full bg-peach"
                        style={{
                          width:
                            approvedReviews.length > 0
                              ? `${(count / approvedReviews.length) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-xs text-ink-muted w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review list */}
            <div className="md:col-span-2 space-y-4">
              {approvedReviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-brand p-5 shadow-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-ink text-sm">
                        {review.guest_name || "Verified Customer"}
                      </p>
                      {review.is_verified_purchase && (
                        <span className="text-xs text-sage-dark font-semibold">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={
                            s <= review.rating
                              ? "text-peach fill-peach"
                              : "text-ink/20"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <p className="font-semibold text-ink text-sm mb-1">
                      {review.title}
                    </p>
                  )}
                  <p className="text-ink-muted text-sm leading-relaxed font-medium">
                    {review.body}
                  </p>
                  <p className="text-xs text-ink-muted mt-3">
                    {(() => {
                      const d = new Date(review.created_at);
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
                    })()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related Products ──────────────────────── */}
      {relatedProducts.length > 0 && (
        <ProductSection
          title="You May Also Like"
          products={relatedProducts}
          viewAllHref={`/products?category=${product.categories?.slug}`}
          badge="Related"
          scrollable
        />
      )}

    </div>
  );
}

// Cache-busting comment: Force Turbopack to drop stale lucide-react module factory error
