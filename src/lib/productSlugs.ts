/**
 * Product slugs that were renamed for SEO (junk "color", mixed-case, etc.),
 * old (lowercased) → new. next.config.ts 308-redirects the old URLs to the new
 * ones, and these helpers make the product page + sitemap work no matter
 * whether the database row has been renamed yet:
 *   - requests for the NEW slug fall back to the row still stored under the OLD slug;
 *   - canonical URLs / sitemap entries always use the NEW slug.
 * Once a row is renamed in the database the fallback simply stops being needed.
 *
 * Keep in sync with the `/product/<old>` redirects in next.config.ts.
 */
export const RENAMED_SLUGS: Record<string, string> = {
  color: "color-blocked-diaper-bag",
  "multipurpose-quilted-diaper-bag": "quilted-multipurpose-diaper-bag",
  "flap-check-bag": "flap-check-diaper-bag",
  "comfy-rider-lite": "comfy-rider-lite-stroller",
};

/** The slug a product should be reachable at (and canonicalised to). */
export function canonicalProductSlug(slug: string): string {
  return RENAMED_SLUGS[slug.toLowerCase()] ?? slug;
}

/** If `newSlug` is a renamed product, the slug its row may still be stored under. */
export function legacySlugFor(newSlug: string): string | null {
  const entry = Object.entries(RENAMED_SLUGS).find(([, n]) => n === newSlug.toLowerCase());
  return entry ? entry[0] : null;
}
