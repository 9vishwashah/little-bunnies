"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { CLOUDINARY_ENABLED, cloudinaryFetchUrl } from "@/lib/cloudinary";

const SUPABASE_URL = "https://jspszcrdxenulgcoziir.supabase.co";

/**
 * Returns true if the URL is served from Supabase storage.
 * For Supabase URLs we bypass the local Next.js image optimizer (`unoptimized=true`)
 * so images are fetched directly from Supabase's global CDN.
 *
 * Why: Next.js image optimizer proxies the request locally, adding latency.
 * Supabase already serves from a global CDN with proper cache headers,
 * so going direct is both faster and avoids 500 errors in dev.
 */
function isSupabaseUrl(src: string): boolean {
  return typeof src === "string" && src.startsWith(SUPABASE_URL);
}

/**
 * Rewrites a Supabase Storage public-object URL to Supabase's own image
 * transform endpoint, requesting a size/quality appropriate to how large the
 * image is actually displayed. Admin-uploaded product photos can be several
 * MB at full resolution — serving that untouched to an 80px thumbnail is
 * what made galleries take the better part of a minute to load. The
 * transform endpoint also auto-negotiates WebP/AVIF via the browser's
 * Accept header, which on its own typically cuts payload size 20-40x.
 * Falls back to the original URL untouched for non-Supabase sources.
 *
 * `resize=contain` is required, not cosmetic: given only `width` (no
 * `height`), Supabase's transform endpoint doesn't scale proportionally —
 * it keeps the original height and crops the width down to fit, silently
 * cutting off the sides of anything taller than it is wide. `contain`
 * forces a proportional scale instead, matching what a plain `?width=`
 * request should have done in the first place.
 */
export function getOptimizedImageUrl(src: string, width: number, quality = 75): string {
  if (!isSupabaseUrl(src)) return src;
  // Cloudinary (when configured) serves the same Supabase originals from its
  // own CDN, resized and as AVIF/WebP; otherwise use Supabase's transform below.
  if (CLOUDINARY_ENABLED) return cloudinaryFetchUrl(src, { width });
  const transformed = src.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const separator = transformed.includes("?") ? "&" : "?";
  return `${transformed}${separator}width=${Math.max(1, Math.round(width))}&quality=${quality}&resize=contain`;
}

type ProductImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** Show a shimmer skeleton while the image loads. Defaults to true. */
  showSkeleton?: boolean;
};

/**
 * Smart product image component with:
 * - Direct Supabase CDN delivery (no local proxy, no 500 errors)
 * - Server-side resize + WebP/AVIF negotiation via Supabase's transform endpoint
 * - Shimmer skeleton loader while loading
 * - Graceful fallback to placeholder on error
 * - Fade-in reveal on load
 */
export default function ProductImage({
  src,
  alt,
  showSkeleton = true,
  className = "",
  style,
  width,
  ...props
}: ProductImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const rawSrc = error ? "/images/placeholder.jpg" : src;
  // Bypass local Next.js image optimizer for Supabase URLs — use CDN directly
  const useUnoptimized = isSupabaseUrl(rawSrc);

  // `fill` images don't have a known display width ahead of time — 800px
  // comfortably covers hero/gallery use while still being a fraction of a
  // multi-MB original. Explicit `width` usages (cards, thumbnails) request
  // ~2x that for retina screens.
  const requestWidth = typeof width === "number" ? Math.min(width * 2, 1600) : 800;
  const imageSrc = useUnoptimized ? getOptimizedImageUrl(rawSrc, requestWidth) : rawSrc;

  return (
    <span className="relative block w-full h-full" style={style}>
      {/* Shimmer skeleton shown while image loads */}
      {showSkeleton && loading && (
        <span
          className="skeleton absolute inset-0"
          style={{ borderRadius: "inherit" }}
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        width={width}
        src={imageSrc}
        alt={alt}
        unoptimized={useUnoptimized}
        className={`${className} transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </span>
  );
}
