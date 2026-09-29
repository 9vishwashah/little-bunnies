"use client";

import Script from "next/script";
import { META_PIXEL_ID } from "@/lib/meta-pixel";

/**
 * Loads the official Meta Pixel base script exactly once, site-wide, via
 * `next/script` (afterInteractive — runs as soon as the page is
 * interactive, without blocking hydration). This is the ONLY place the
 * base init snippet lives; everything else in the app fires events through
 * `@/lib/meta-pixel`'s helpers, never a second `fbq('init', ...)`.
 *
 * Meta's own snippet fires the first `PageView` itself right after init —
 * see MetaPixelRouteTracker for the client-side-navigation follow-ups,
 * which deliberately skip re-firing that same initial view.
 *
 * Renders nothing (no script, no noscript pixel) if the Pixel ID env var
 * isn't set, so a missing/blank config can never throw or half-initialize.
 */
export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
