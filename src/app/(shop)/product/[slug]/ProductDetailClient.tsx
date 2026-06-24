"use client";

import { useState, useEffect } from "react";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  MessageCircle,
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
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
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
  // Use state for URL so SSR and client render identically (avoids hydration mismatch)
  const [pageUrl, setPageUrl] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const primaryImage = images[selectedImage] || images[0];
  const discount = calculateDiscount(product.price, product.compare_price || 0);
  const currentPrice = product.price + (selectedVariant?.price_modifier || 0);

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-muted font-medium mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16">
        {/* ── Gallery ─────────────────────────────── */}
        <div>
          {/* Main image */}
          <div className="relative aspect-square rounded-brand overflow-hidden bg-cream-dark mb-3">
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
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && <span className="badge-sale">{discount}% OFF</span>}
              {product.is_new_arrival && <span className="badge-new">NEW</span>}
            </div>

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
        </div>

        {/* ── Product Info ─────────────────────────── */}
        <div>
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-2">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink leading-tight mb-3">
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
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-bold text-ink text-3xl">
              {formatPrice(currentPrice)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-lg text-ink-muted line-through font-medium">
                {formatPrice(product.compare_price)}
              </span>
            )}
            {discount > 0 && (
              <span className="badge-sale text-sm px-3 py-1.5">{discount}% OFF</span>
            )}
          </div>


          {/* Short description */}
          {product.short_description && (
            <p className="text-ink-light text-sm leading-relaxed mb-5 font-medium">
              {product.short_description}
            </p>
          )}

          {/* Variants */}
          {Object.entries(variantGroups).map(([groupName, variants]) => (
            <div key={groupName} className="mb-5">
              <p className="font-semibold text-ink text-sm mb-2.5">
                {groupName}:{" "}
                {selectedVariant?.name === groupName && (
                  <span className="text-ink-muted font-medium">{selectedVariant.value}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(
                        selectedVariant?.id === variant.id ? null : variant
                      )
                    }
                    className={cn(
                      "px-4 py-2 rounded-pill border-2 text-sm font-semibold transition-all",
                      selectedVariant?.id === variant.id
                        ? "border-ink bg-ink text-cream"
                        : "border-ink/15 text-ink hover:border-ink/40"
                    )}
                  >
                    {variant.value}
                    {variant.price_modifier !== 0 && (
                      <span className="text-xs ml-1 opacity-70">
                        ({variant.price_modifier > 0 ? "+" : ""}
                        {formatPrice(variant.price_modifier)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <p className="font-semibold text-ink text-sm mb-2.5">Quantity</p>
            <div className="inline-flex items-center gap-1 bg-cream-dark rounded-pill p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-bold text-ink text-lg">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="btn-primary w-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              {product.in_stock ? "Add to Cart" : "Out of Stock"}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full text-base py-4"
            >
              <MessageCircle size={18} />
              Enquire on WhatsApp
            </a>
          </div>

          {/* Share */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-full gap-2 px-5 py-3 rounded-pill border-2 border-ink/15 text-sm font-semibold hover:bg-cream-dark transition-colors"
            >
              <Share2 size={16} />
              Share this Product
            </button>
          </div>

          {/* Delivery Info Accordion */}
          {[
            {
              key: "delivery",
              icon: Truck,
              title: "Delivery & Shipping",
              content:
                "Estimated delivery: 14 business days.",
            },
            {
              key: "returns",
              icon: RotateCcw,
              title: "Returns & Exchanges",
              content:
                "15-day hassle-free returns. Item must be unused and in original packaging. Contact our WhatsApp support to initiate a return.",
            },
            {
              key: "safety",
              icon: Shield,
              title: "Safety & Certifications",
              content:
                "All Little Bunnies products are BPA-free, non-toxic, and comply with Indian baby safety standards. Safe for newborns 0-6 months.",
            },
          ].map(({ key, icon: Icon, title, content }) => (
            <div key={key} className="border-t border-ink/8">
              <button
                onClick={() => toggleSection(key)}
                className="flex items-center justify-between w-full py-4 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className="text-ink-muted" strokeWidth={1.8} />
                  <span className="font-semibold text-ink text-sm">{title}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-ink-muted transition-transform",
                    expandedSection === key && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {expandedSection === key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-4 text-sm text-ink-muted font-medium leading-relaxed">
                      {content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* ── Description ──────────────────────────────── */}
      {product.description && (
        <section className="mt-12 bg-cream-dark/50 rounded-[2rem] p-6 md:p-10">
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-5">
            About this product
          </h2>
          <div
            className="prose prose-sm max-w-none text-ink-light"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
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
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
