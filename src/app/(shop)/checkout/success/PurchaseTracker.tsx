"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/meta-pixel";

interface Props {
  orderId: string;
  contentIds: string[];
  numItems: number;
  value: number;
}

// Persisted (not just a React ref) so a page refresh, back/forward
// navigation, or a second mount in dev's StrictMode never re-fires Purchase
// for an order this browser has already reported. Keyed by orderId — the
// same stable identifier the order/payment flow itself uses, not one we
// invent — and capped so this never grows unbounded for a long-lived
// browser profile.
const STORAGE_KEY = "little-bunnies-meta-purchases-tracked";
const MAX_TRACKED = 200;

function alreadyTracked(orderId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.includes(orderId);
  } catch {
    return false;
  }
}

function markTracked(orderId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    ids.push(orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-MAX_TRACKED)));
  } catch {
    // Private browsing / storage disabled — worst case this order could
    // fire again on a later visit, which is still far better than crashing.
  }
}

/**
 * Fires the Meta Pixel Purchase event exactly once for a given order, no
 * matter how many times this success page is mounted, refreshed, or
 * revisited. Rendered only by the order-success page, only once the caller
 * has already fetched a real, paid order — this component itself doesn't
 * decide whether a purchase happened, it only guards against reporting the
 * same one twice.
 */
export default function PurchaseTracker({ orderId, contentIds, numItems, value }: Props) {
  const firedThisMount = useRef(false);

  useEffect(() => {
    if (!orderId || firedThisMount.current) return;
    if (alreadyTracked(orderId)) return;

    firedThisMount.current = true;
    markTracked(orderId);
    trackPurchase({ contentIds, numItems, value, orderId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return null;
}
