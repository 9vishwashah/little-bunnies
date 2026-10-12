import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Explicitly declare all public (non-auth-required) routes.
 * Clerk will NOT inject auth cookies or X-Robots-Tag: noindex headers for
 * these routes, which is critical for Googlebot to index the site properly.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/product(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/faq(.*)",
  "/wholesale(.*)",
  "/work-for-us(.*)",
  "/shipping-policy(.*)",
  "/returns(.*)",
  "/exchange-policy(.*)",
  "/privacy-policy(.*)",
  "/terms(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Public API routes
  "/api/products(.*)",
  "/api/categories(.*)",
  // Sitemaps + robots — always public
  "/sitemap.xml",
  "/robots.txt",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Old category URLs → the landing pages built to rank for those searches.
  // Done here rather than in next.config.ts redirects because next.config
  // redirects forward the query string (/prams-strollers?category=prams),
  // while this produces the clean URL.
  if (req.nextUrl.pathname === "/products") {
    const category = req.nextUrl.searchParams.get("category");
    const target =
      category === "prams" || category === "strollers"
        ? "/prams-strollers"
        : category === "bags"
        ? "/diaper-bags"
        : null;
    if (target) return NextResponse.redirect(new URL(target, req.url), 308);
  }

  // Admin routes: must be signed in
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Account/checkout/cart/wishlist: require sign-in
  // (These are disallowed in robots.ts anyway, so noindex is fine)

  // All other routes (especially the shop) are public — do nothing.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
