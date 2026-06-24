"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

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

type ProductImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** Show a shimmer skeleton while the image loads. Defaults to true. */
  showSkeleton?: boolean;
};

/**
 * Smart product image component with:
 * - Direct Supabase CDN delivery (no local proxy, no 500 errors)
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
  ...props
}: ProductImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageSrc = error ? "/images/placeholder.jpg" : src;
  // Bypass local Next.js image optimizer for Supabase URLs — use CDN directly
  const useUnoptimized = isSupabaseUrl(imageSrc);

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
