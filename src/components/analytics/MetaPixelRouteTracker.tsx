"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/meta-pixel";

/**
 * Fires a PageView on every client-side route change (App Router
 * navigations don't reload the page, so the base snippet in <head> —
 * which fires the first PageView itself — only ever covers the page a
 * visitor lands on).
 *
 * Compares against the last URL seen instead of using a "first run" flag,
 * so the initial page is never re-reported even if React re-runs this
 * effect (dev StrictMode double-invokes effects).
 */
export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = `${pathname}?${searchParams.toString()}`;
    if (lastUrl.current === null) {
      lastUrl.current = url; // initial page — already tracked by the <head> snippet
      return;
    }
    if (lastUrl.current === url) return;
    lastUrl.current = url;
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
