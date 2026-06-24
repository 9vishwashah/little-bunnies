"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

/**
 * Manually triggers Zustand persist hydration for all stores after mount.
 * This prevents SSR/client hydration mismatches caused by localStorage data
 * differing from the server-rendered HTML (which always starts with empty state).
 *
 * Place this component once near the root of the app (inside a Client boundary).
 */
export default function StoreHydration() {
  useEffect(() => {
    // Rehydrate all persisted stores from localStorage after first render
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useRecentlyViewedStore.persist.rehydrate();
  }, []);

  return null;
}
