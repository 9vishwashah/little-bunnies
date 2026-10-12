/**
 * Little Bunnies listings on Amazon.in, keyed by this site's product slug.
 * Matched to the site's products by price/MRP and specs (e.g. the Cocoon
 * listing's ₹23,999 MRP and 8.5 kg weight match the `cocoon` product).
 *
 * Used for (1) `sameAs` in each product's JSON-LD — tells search engines the
 * Amazon listing and this page describe the same item — and (2) a visible
 * "Also available on Amazon.in" link. Flip SHOW_AMAZON_LINKS to hide the link
 * without losing the structured-data signal.
 */
export const SHOW_AMAZON_LINKS = true;

export interface AmazonListing {
  asin: string;
  url: string;
}

const amazon = (asin: string): AmazonListing => ({
  asin,
  url: `https://www.amazon.in/dp/${asin}`,
});

export const AMAZON_LISTINGS: Record<string, AmazonListing> = {
  "new-born-stroller": amazon("B0HLPVMBWX"), // Baby Stroller with Reversible Handle, Chocolate
  "little-bunnies-comfy-rider-travel-stroller-reversible-parent-facing-seat-adjustable-recline-upf-50-canopy-compact-fold-lightweight-design":
    amazon("B0HLPPMPGP"), // Comfy Rider | Travel Stroller | Ashgrey
  "twin-stroller": amazon("B0HMCB1XXN"), // Foldable Double Stroller with XL Canopy
  "little-bunnies-urban-glider-reversible-baby-stroller-parent-forward-facing-adjustable-recline-one-click-steering-compact-fold-storage-basket":
    amazon("B0HLQ1JTVG"), // Urban Glider | Reversible Baby Stroller | Beige
  cocoon: amazon("B0HLPWG7HT"), // Cocoon | Egg Prams | Aluminium Frame | Black
};

export function getAmazonListing(slug: string): AmazonListing | null {
  return AMAZON_LISTINGS[slug] ?? null;
}
