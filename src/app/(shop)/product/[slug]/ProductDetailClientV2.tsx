"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProductImage, { getOptimizedImageUrl } from "@/components/ui/ProductImage";
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
  Copy,
  Info,
  Heart,
  BookOpen,
  Play,
  Film,
  Tag,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { productDisplayName } from "@/lib/seo";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product, ProductVariant, ProductVideo, ProductVideoType } from "@/types";
import {
  formatPrice,
  calculateDiscount,
  getWhatsAppUrl,
  cn,
  PROMO_COUPON_CODE,
  PROMO_COUPON_LABEL,
  promoSaving,
} from "@/lib/utils";
import FeatureHighlights, { NameHighlights } from "@/components/product/FeatureHighlights";
import TrustBadges from "@/components/product/TrustBadges";
import ProductSection from "@/components/home/ProductSection";
import { toast } from "sonner";
import { trackViewContent, trackAddToCart } from "@/lib/meta-pixel";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialVideo?: string;
  /** Amazon.in listing for this product, when one exists (see lib/amazon.ts). */
  amazonUrl?: string;
}

/** A gallery slide showing a poster + play button until clicked, so the
 *  video itself is never fetched until the user actually wants to watch it.
 *  The container always renders (even before a video is uploaded) so its
 *  URL can be copied / turned into a QR code ahead of time. */
function VideoGallerySlide({
  video,
  label,
  posterFallback,
  productName,
}: {
  video: ProductVideo | null;
  label: string;
  posterFallback?: string;
  productName: string;
}) {
  const [playing, setPlaying] = useState(false);
  const poster = video?.thumbnail_url || posterFallback || "/images/placeholder.jpg";

  if (playing && video) {
    return (
      <video
        className="absolute inset-0 w-full h-full object-contain bg-black"
        src={video.url}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="auto"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => video && setPlaying(true)}
      disabled={!video}
      className={cn(
        "absolute inset-0 w-full h-full group/video",
        video ? "cursor-pointer" : "cursor-default"
      )}
      aria-label={video ? `Play ${label}` : `${label} — coming soon`}
    >
      <ProductImage
        src={poster}
        alt={`${productName} — ${label}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <span className="absolute inset-0 bg-black/25 group-hover/video:bg-black/35 transition-colors" />
      {video ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 backdrop-blur-sm shadow-soft-lg flex items-center justify-center transition-transform group-hover/video:scale-110">
            <Play size={30} className="text-ink fill-ink ml-1" />
          </span>
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <Film size={26} className="text-ink/60" />
          </span>
          <span className="px-3 py-1.5 rounded-full bg-ink/80 backdrop-blur-sm text-white text-xs font-bold">
            Video coming soon
          </span>
        </span>
      )}
    </button>
  );
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  initialVideo,
  amazonUrl,
}: ProductDetailClientProps) {
  // Clean, searchable heading ("Little Bunnies Eco Pro Baby Stroller") rather
  // than just the short model name — the page's H1 should carry the product type.
  const displayName = productDisplayName({
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    categorySlug: product.categories?.slug,
  });
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => product.product_variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>("delivery");
  const [pageUrl, setPageUrl] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<"idle" | "valid" | "invalid">("idle");
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  // Warm the /checkout route on mount so "Buy Now" doesn't have to wait on
  // a cold RSC fetch — under a slow connection that delay can read as the
  // button "not working."
  useEffect(() => {
    router.prefetch("/checkout");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coming back to this page with Back (browser restores it from memory) must
  // not leave Buy Now stuck on its spinner.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setBuyNowLoading(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

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
      } else if (parsed.swatch) {
        images = [
          {
            id: "variant-img-swatch",
            product_id: product.id,
            url: parsed.swatch,
            sort_order: 0,
            is_primary: true,
          },
          ...images,
        ];
      }
    } catch (e) {}
  }

  // Video slides (Assembly / Features) — appended after the image slides.
  // Shown even before a video is uploaded (as a "coming soon" placeholder)
  // so the slide's URL can be copied / turned into a QR code ahead of
  // time — unless the admin has turned that off for products that will
  // never have one (e.g. diaper bags). An already-uploaded video always
  // shows regardless of that setting.
  const showEmptyVideoSlots = product.show_video_placeholders !== false;
  const videoSlideDefs: { type: ProductVideoType; label: string }[] = [
    { type: "assembly", label: "Assembly Video" },
    { type: "features", label: "Features Video" },
  ];
  const videoSlides = videoSlideDefs
    .map(({ type, label }) => ({
      type,
      label,
      video: product.product_videos?.find((v) => v.type === type) || null,
    }))
    .filter((slide) => slide.video || showEmptyVideoSlots);

  type GallerySlide =
    | { kind: "image"; image: (typeof images)[number] }
    | { kind: "video"; type: ProductVideoType; label: string; video: ProductVideo | null };

  const slides: GallerySlide[] = [
    ...images.map((image) => ({ kind: "image" as const, image })),
    ...videoSlides.map((v) => ({ kind: "video" as const, ...v })),
  ];

  const [activeSlide, setActiveSlide] = useState(() => {
    if (initialVideo) {
      const idx = slides.findIndex((s) => s.kind === "video" && s.type === initialVideo);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const currentSlide = slides[activeSlide];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent, slideCount: number) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      slideCount <= 1 ||
      currentSlide?.kind === "video"
    )
      return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
      if (diffX < 0) {
        setActiveSlide((i) => (i + 1) % slideCount);
      } else {
        setActiveSlide((i) => (i - 1 + slideCount) % slideCount);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keep the URL in sync with the active slide so a video slide can be
  // copy-linked and reopened directly (?video=assembly / ?video=features).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (currentSlide?.kind === "video") {
      url.searchParams.set("video", currentSlide.type);
    } else {
      url.searchParams.delete("video");
    }
    const next = `${url.pathname}${url.search}`;
    const prev = `${window.location.pathname}${window.location.search}`;
    if (next !== prev) {
      window.history.replaceState(null, "", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlide]);

  const primaryImage =
    (currentSlide?.kind === "image" ? currentSlide.image : images[0]) || images[0];
  const discount = calculateDiscount(product.price, product.compare_price || 0);
  const currentPrice = product.price + (selectedVariant?.price_modifier || 0);
  const finalPrice = currentPrice;
  // Offer price shown to shoppers = price after the promo code (same rounding as checkout).
  const listPrice =
    product.compare_price && product.compare_price > finalPrice ? product.compare_price : finalPrice;
  const promoAmount = promoSaving(finalPrice);
  const offerPrice = finalPrice - promoAmount;
  const offerSaving = listPrice - offerPrice;
  const offerPercent = listPrice > 0 ? Math.round((offerSaving / listPrice) * 100) : 0;

  const whatsappUrl = getWhatsAppUrl(product.name, pageUrl);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(PROMO_COUPON_CODE);
    toast.success(`Coupon code ${PROMO_COUPON_CODE} copied!`);
  };

  const handleShareCoupon = async () => {
    const shareText = `Use code ${PROMO_COUPON_CODE} for ${PROMO_COUPON_LABEL} at Little Bunnies! 🐰`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Little Bunnies Coupon", text: shareText, url: pageUrl });
      } catch {
        // user cancelled the share sheet — no error needed
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${pageUrl}`);
      toast.success("Coupon link copied to clipboard!");
    }
  };

  const handleCopyVideoLink = (type: ProductVideoType) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("video", type);
    navigator.clipboard.writeText(url.toString());
    toast.success("Video link copied!");
  };

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

  // Meta Pixel — one ViewContent per product page view.
  useEffect(() => {
    trackViewContent({
      contentId: product.id,
      contentName: product.brand || product.name,
      value: product.price,
    });
  }, [product.id, product.brand, product.name, product.price]);

  // Auto slide removed — images change only on manual swipe/click

  const handleAddToCart = () => {
    const activeVariant =
      selectedVariant ||
      (product.product_variants && product.product_variants.length > 0
        ? product.product_variants[0]
        : undefined);

    addItem({
      id: product.id,
      name: product.brand || product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage?.url || "/images/placeholder.jpg",
      quantity,
      variant: activeVariant
        ? {
            id: activeVariant.id,
            name: activeVariant.name,
            value: activeVariant.value,
            price_modifier: activeVariant.price_modifier,
          }
        : undefined,
    });
    toast.success("Added to cart!");

    // Meta Pixel — fires only after the cart write above has actually
    // happened (Zustand's set() is synchronous, so this always reflects a
    // real, successful add — never a bare button click).
    trackAddToCart({
      contentId: product.id,
      contentName: product.brand || product.name,
      value: product.price + (activeVariant?.price_modifier || 0),
      quantity,
    });
  };

  const handleBuyNow = () => {
    // Guards against a slow/laggy navigation being mistaken for "nothing
    // happened" and re-clicked — without this, a second click before the
    // route transition completes would silently add the item twice.
    if (buyNowLoading) return;
    setBuyNowLoading(true);
    handleAddToCart();
    router.push("/checkout");
    // The cart is already saved, so if the in-app transition stalls (slow or
    // dropped network request) fall back to a normal page load rather than
    // leaving the shopper on a spinner that never goes anywhere.
    window.setTimeout(() => {
      if (window.location.pathname !== "/checkout") window.location.assign("/checkout");
    }, 4000);
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


      {/* Mobile product title — shown instead of breadcrumb */}
      {/* The concise brand/model name is the real page heading — the
          long feature-list `name` is descriptive body copy, not a title. */}
      <div className="md:hidden mb-4">
        <h1 className="text-base sm:text-lg font-bold text-ink uppercase tracking-widest mb-1.5">
          {displayName}
        </h1>
        {product.brand && <NameHighlights name={product.name} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16">
        {/* ── Gallery ─────────────────────────────── */}
        <div className="relative">
          {/* Main image */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, slides.length)}
            className="relative aspect-square rounded-brand overflow-hidden bg-white mb-3 group touch-pan-y select-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                drag={slides.length > 1 && currentSlide?.kind !== "video" ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(e, { offset, velocity }) => {
                  if (slides.length <= 1 || currentSlide?.kind === "video") return;
                  const swipeThreshold = 40;
                  if (offset.x < -swipeThreshold || velocity.x < -300) {
                    setActiveSlide((i) => (i + 1) % slides.length);
                  } else if (offset.x > swipeThreshold || velocity.x > 300) {
                    setActiveSlide((i) => (i - 1 + slides.length) % slides.length);
                  }
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                {currentSlide?.kind === "video" ? (
                  <VideoGallerySlide
                    video={currentSlide.video}
                    label={currentSlide.label}
                    posterFallback={images[0]?.url}
                    productName={product.name}
                  />
                ) : (
                  <ProductImage
                    src={primaryImage?.url || "/images/placeholder.jpg"}
                    alt={primaryImage?.alt || product.name}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Mobile swipe indicator pill */}
            {slides.length > 1 && (
              <div className="absolute top-4 right-16 z-10 md:hidden px-2.5 py-1 rounded-full bg-ink/75 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider pointer-events-none shadow-sm">
                {activeSlide + 1} / {slides.length}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {currentSlide?.kind === "video" ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ink/80 backdrop-blur-sm text-white text-[11px] font-bold tracking-wide">
                  {currentSlide.label}
                </span>
              ) : (
                product.is_new_arrival && <span className="badge-new">NEW</span>
              )}
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
            {slides.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveSlide((i) => (i - 1 + slides.length) % slides.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setActiveSlide((i) => (i + 1) % slides.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Copy Video Link (video slides only) */}
            {currentSlide?.kind === "video" && (
              <button
                type="button"
                onClick={() => handleCopyVideoLink(currentSlide.type)}
                title="Copy a direct link to this video"
                className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-ink text-xs font-bold shadow-soft hover:shadow-soft-lg hover:bg-cream transition-all border border-ink/10 hover:scale-105"
              >
                <Copy size={14} />
                <span>Copy Link</span>
              </button>
            )}
          </div>


          {/* Thumbnail strip */}
          {slides.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {slides.map((slide, i) => (
                <button
                  key={slide.kind === "image" ? slide.image.id : `video-${slide.type}`}
                  onClick={() => setActiveSlide(i)}
                  title={slide.kind === "video" ? slide.label : undefined}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all bg-cream-dark/30",
                    i === activeSlide
                      ? "border-ink scale-105"
                      : "border-transparent hover:border-ink/30"
                  )}
                >
                  {slide.kind === "video" ? (
                    <>
                      <ProductImage
                        src={slide.video?.thumbnail_url || images[0]?.url || "/images/placeholder.jpg"}
                        alt={slide.label}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                      <span className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        {slide.video ? (
                          <Play size={16} className="text-white fill-white" />
                        ) : (
                          <Film size={15} className="text-white/80" />
                        )}
                      </span>
                    </>
                  ) : (
                    <ProductImage
                      src={slide.image.url}
                      alt={slide.image.alt || product.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  )}
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
                      onClick={() => setSelectedVariant(variant)}
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
                        <img
                          src={getOptimizedImageUrl(swatchUrl, 96)}
                          alt={variant.value}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
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
          {/* Brand — desktop only (mobile brand shown above gallery). This is
              the real page heading; the long feature-list `name` below is
              descriptive body copy, not a title. */}
          <h1 className="hidden md:block text-lg md:text-xl font-bold text-ink uppercase tracking-widest mb-2">
            {displayName}
          </h1>

          {/* Name — desktop only (mobile title shown above gallery) */}
          {product.brand && <NameHighlights name={product.name} className="hidden md:block mb-4" />}

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

          {/* Price — headline is the price after the promo code, with the
              original price, the saving and the code beside it. The coupon card
              below stays as the copy-the-code fallback. */}
          <div className="mb-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-bold text-ink text-3xl">{formatPrice(offerPrice)}</span>
              <span className="text-base text-ink-muted line-through font-medium">
                {formatPrice(listPrice)}
              </span>
              <span className="rounded-full bg-[#8E2439]/10 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-[#8E2439]">
                {offerPercent}% off
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-sage-dark">
              You save {formatPrice(offerSaving)} with code {PROMO_COUPON_CODE}
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink-muted">
              Diwali offer price: enter {PROMO_COUPON_CODE} at checkout. Limited-time offer; the final amount is confirmed at checkout.
            </p>
          </div>

          {/* Coupon card */}
          <div className="mb-5 relative overflow-hidden rounded-xl border-2 border-dashed border-sage-dark/40 bg-sage-light/20 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Tag size={18} className="text-sage-dark flex-shrink-0" />
                <div>
                  <p className="font-mono font-bold text-ink text-sm tracking-wider">
                    {PROMO_COUPON_CODE}
                  </p>
                  <p className="text-xs text-ink-muted font-medium">
                    {PROMO_COUPON_LABEL} — apply at checkout
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleCopyCoupon}
                  title="Copy code"
                  className="p-2 rounded-lg bg-white/70 hover:bg-white text-ink transition-colors"
                >
                  <Copy size={15} />
                </button>
                <button
                  onClick={handleShareCoupon}
                  title="Share coupon"
                  className="p-2 rounded-lg bg-white/70 hover:bg-white text-ink transition-colors"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons — Add to Cart / Buy Now */}
          <div className="flex gap-3 mb-4 w-full">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="btn-secondary flex-1 text-sm h-12 max-h-12 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={17} className="flex-shrink-0" />
              <span className="truncate">Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.in_stock || buyNowLoading}
              className="btn-primary flex-1 text-sm h-12 max-h-12 flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {buyNowLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <span className="truncate">Buy Now</span>
              )}
            </button>
          </div>
          {!product.in_stock && (
            <p className="text-xs text-red-500 font-semibold mb-4 -mt-2">
              Currently out of stock.
            </p>
          )}

          {amazonUrl && (
            <p className="text-xs text-ink-muted font-medium mb-4 -mt-1">
              Also available on{" "}
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-ink underline underline-offset-2 hover:text-peach-dark"
              >
                Amazon.in
              </a>
            </p>
          )}

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

          {/* Warranty / exchange / secure-payment reassurance */}
          <TrustBadges />

          {/* Key benefits: four short highlights; the complete list stays
              available (and in the page HTML) in the section below. */}
          {product.short_description && (
            <>
              <FeatureHighlights html={product.short_description} />

              <details className="group border-t border-ink/8">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2.5">
                    <Info size={18} className="text-ink-muted" strokeWidth={1.8} />
                    <span className="font-semibold text-ink text-sm">Full features &amp; specifications</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="text-ink-muted transition-transform group-open:rotate-180"
                  />
                </summary>
                <div
                  className="pb-4 text-ink-light text-sm leading-relaxed font-medium prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              </details>
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
