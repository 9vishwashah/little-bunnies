"use client";

import { useState, useEffect } from "react";
import ProductImage from "@/components/ui/ProductImage";
import PreOrderModal from "@/components/ui/PreOrderModal";
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
  Maximize,
  X,
  Clock,
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
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [preOrderOpen, setPreOrderOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

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

  // Auto slide images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImage((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

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
        <div className="relative">
          {/* Main image */}
          <div 
            className="relative aspect-square rounded-brand overflow-hidden bg-cream-dark mb-3 cursor-crosshair group"
            onClick={() => setIsEnlarged(true)}
          >
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

            {/* Expand Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEnlarged(true);
              }}
              className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all z-10"
            >
              <Maximize size={18} />
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



          {/* Action buttons — side by side */}
          <div className="flex flex-row gap-3 mb-4 w-full">
            <button
              onClick={() => setPreOrderOpen(true)}
              className="btn-primary flex-1 text-sm h-12 max-h-12 min-w-0 bg-peach hover:bg-peach-dark"
            >
              <Clock size={17} className="flex-shrink-0" />
              <span className="truncate">Pre-Order Now</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-12 max-h-12 px-4 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 min-w-0"
              style={{ backgroundColor: "#25D366" }}
            >
              {/* Official WhatsApp SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 flex-shrink-0"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="truncate">WhatsApp</span>
            </a>
          </div>

          {/* Share button */}
          <div className="mb-6">
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-full gap-2 px-5 py-3 rounded-pill border-2 border-ink/15 text-sm font-semibold hover:bg-cream-dark transition-colors"
            >
              <Share2 size={16} />
              Share this Product
            </button>
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
              <div className="block md:hidden mb-5 border-t border-b border-ink/8">
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

          {/* Accordion moved below description — placeholder spacer */}
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

      {/* ── Delivery / Returns / Safety Accordion ──── */}
      <section className="mt-8 border-t border-ink/8">
        {[
          {
            key: "delivery",
            icon: Truck,
            title: "Delivery & Shipping",
            content: "Estimated delivery: 14 business days.",
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
          <div key={key} className="border-b border-ink/8">
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
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isEnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-10 cursor-zoom-out"
            onClick={() => setIsEnlarged(false)}
          >
            <button
              onClick={() => setIsEnlarged(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            >
              <X size={24} />
            </button>
            
            <div 
              className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ProductImage
                src={primaryImage?.url || "/images/placeholder.jpg"}
                alt={primaryImage?.alt || product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />

              {/* Lightbox Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((i) => (i - 1 + images.length) % images.length);
                    }}
                    className="absolute left-0 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all -ml-2 md:-ml-12 z-50"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((i) => (i + 1) % images.length);
                    }}
                    className="absolute right-0 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all -mr-2 md:-mr-12 z-50"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={preOrderOpen}
        onClose={() => setPreOrderOpen(false)}
        productName={product.name}
        productPrice={formatPrice(currentPrice)}
        productImage={primaryImage?.url}
      />

    </div>
  );
}

// Cache-busting comment: Force Turbopack to drop stale lucide-react module factory error
