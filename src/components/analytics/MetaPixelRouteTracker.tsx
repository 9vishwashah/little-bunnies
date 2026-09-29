"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/meta-pixel";

/**
 * Fires a PageView on every client-side route change (App Router
 * navigations don't reload the page, so the base Pixel script's one-time
 * init PageView only ever covers the very first page a visitor lands on).
 *
 * The first run of this effect corresponds to that same initial page —
 * already covered by MetaPixel's init snippet — so it's deliberately
 * skipped here to avoid a duplicate PageView, and only fires from the
 * second render (an actual navigation) onward.
 */
export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
