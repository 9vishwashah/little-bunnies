import { SITE_URL } from "@/lib/seo";

/**
 * Cloudinary delivery, in "remote fetch" mode.
 *
 * Nothing is migrated or re-uploaded: Cloudinary fetches the image from where
 * it already lives (Supabase Storage for product photos, this site for the
 * banners/category art), resizes it, converts it to AVIF/WebP automatically
 * (f_auto), picks a sensible quality (q_auto) and then serves and caches it
 * from its own CDN. Switching it off again is just removing the env var.
 *
 * It stays OFF until NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set (a public name,
 * not a secret), so the site behaves exactly as before until then.
 */
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";

export const CLOUDINARY_ENABLED = CLOUD_NAME.length > 0;

/** Host to preconnect to (null while Cloudinary is off). */
export const CLOUDINARY_ORIGIN = CLOUDINARY_ENABLED ? "https://res.cloudinary.com" : null;

interface FetchOptions {
  /** Longest side wanted, in CSS pixels × device pixel ratio. Never upscales. */
  width: number;
}

/** Cloudinary URL that fetches, optimises and caches `remoteUrl`. */
export function cloudinaryFetchUrl(remoteUrl: string, { width }: FetchOptions): string {
  if (!CLOUDINARY_ENABLED || remoteUrl.startsWith("https://res.cloudinary.com/")) return remoteUrl;
  const w = Math.max(16, Math.round(width));
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto,w_${w},c_limit/${encodeURIComponent(remoteUrl)}`;
}

/**
 * For images in /public (hero banners, category art). Cloudinary fetches them
 * from the live site, so this only kicks in for production builds; locally,
 * and until Cloudinary is configured, the plain path is returned unchanged.
 */
export function siteImage(path: string, width: number): string {
  if (!CLOUDINARY_ENABLED || process.env.NODE_ENV !== "production") return path;
  return cloudinaryFetchUrl(`${SITE_URL}${path}`, { width });
}
