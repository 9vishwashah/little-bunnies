/**
 * Central Meta (Facebook) Pixel tracking utility. This is the ONLY place
 * that should ever call `window.fbq` directly — every event fired from the
 * app goes through the typed helpers below, never raw `fbq(...)` calls
 * scattered across components.
 *
 * Safety contract: nothing in this file can throw or break the app. Every
 * function here silently no-ops (with an optional dev-only console log) if
 * the Pixel ID is missing, `window`/`fbq` aren't available yet (SSR, ad
 * blockers, script still loading), or the call itself errors for any
 * reason. Ecommerce functionality must never depend on tracking succeeding.
 */

// The Pixel ID is public by design (it's in every page's HTML source), so it
// lives here as a constant rather than an env var — a NEXT_PUBLIC_ var is
// baked in at build time, so a missing/stale value on the host silently
// shipped a site with no pixel at all. The base snippet itself is inlined
// in <head> in src/app/layout.tsx, exactly as Meta's setup docs specify.
export const META_PIXEL_ID = "2165380821078785";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
    _fbq?: unknown;
  }
}

const isDev = process.env.NODE_ENV === "development";

function devLog(event: string, params?: unknown) {
  if (isDev) {
    console.debug(`[Meta Pixel] ${event}`, params ?? "");
  }
}

/** True once the base Pixel script has loaded and initialized `window.fbq`. */
export function isPixelReady(): boolean {
  return (
    typeof window !== "undefined" &&
    !!META_PIXEL_ID &&
    typeof window.fbq === "function"
  );
}

/**
 * Normalizes a price value (which may arrive as a string from a form field,
 * DB numeric type serialized as string, etc.) into a safe finite number.
 * Never returns NaN — falls back to 0 rather than sending garbage to Meta.
 */
export function toMoney(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

/**
 * Lowest-level guarded call — every exported tracker below funnels through
 * this. `eventId` (when provided) is passed as fbq's third-argument
 * `eventID` option, which Meta uses for browser/Conversions-API event
 * deduplication; purely additive, never required for our own dedup (see
 * PurchaseTracker for the actual client-side guard).
 */
function fire(event: string, params?: Record<string, unknown>, eventId?: string) {
  try {
    if (!isPixelReady()) {
      devLog(`${event} (skipped — pixel not ready)`, params);
      return;
    }
    if (eventId) {
      window.fbq!("track", event, params, { eventID: eventId });
    } else {
      window.fbq!("track", event, params);
    }
    devLog(event, params);
  } catch (err) {
    // Tracking must never break the site.
    if (isDev) {
      console.debug(`[Meta Pixel] ${event} failed`, err);
    }
  }
}

/**
 * Manual PageView — only needed for client-side route changes after the
 * initial load. The base Pixel script's own init already fires the first
 * PageView, so this is never called for that initial page.
 */
export function trackPageView() {
  fire("PageView");
}

export interface ViewContentParams {
  contentId: string;
  contentName: string;
  value: number | string;
}

export function trackViewContent({ contentId, contentName, value }: ViewContentParams) {
  if (!contentId) return; // never send an empty/undefined content id
  fire("ViewContent", {
    content_ids: [contentId],
    content_type: "product",
    content_name: contentName,
    value: toMoney(value),
    currency: "INR",
  });
}

export interface AddToCartParams {
  contentId: string;
  contentName: string;
  value: number | string;
  quantity?: number;
}

export function trackAddToCart({ contentId, contentName, value, quantity }: AddToCartParams) {
  if (!contentId) return;
  fire("AddToCart", {
    content_ids: [contentId],
    content_type: "product",
    content_name: contentName,
    value: toMoney(value),
    currency: "INR",
    ...(quantity ? { num_items: quantity } : {}),
  });
}

export interface InitiateCheckoutParams {
  contentIds: string[];
  numItems: number;
  value: number | string;
}

export function trackInitiateCheckout({ contentIds, numItems, value }: InitiateCheckoutParams) {
  const ids = contentIds.filter(Boolean);
  if (ids.length === 0) return;
  fire("InitiateCheckout", {
    content_ids: ids,
    content_type: "product",
    num_items: numItems,
    value: toMoney(value),
    currency: "INR",
  });
}

export interface PurchaseParams {
  contentIds: string[];
  numItems: number;
  value: number | string;
  orderId: string;
}

/**
 * `orderId` is used both as Meta's `eventID` (for their own dedup) and by
 * the caller (PurchaseTracker) as the key for our own client-side "already
 * fired for this order" guard — see that component for the actual
 * dedup storage.
 */
export function trackPurchase({ contentIds, numItems, value, orderId }: PurchaseParams) {
  const ids = contentIds.filter(Boolean);
  if (ids.length === 0) return;
  fire(
    "Purchase",
    {
      content_ids: ids,
      content_type: "product",
      num_items: numItems,
      value: toMoney(value),
      currency: "INR",
    },
    orderId || undefined
  );
}

export function trackSearch(searchString: string) {
  const q = searchString.trim();
  if (!q) return;
  fire("Search", { search_string: q });
}
