import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://littlebunnies.co.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // No trailing slash — Next.js doesn't add one to route URLs, and a
        // trailing-slash prefix (e.g. "/cart/") would fail to match the
        // bare route itself ("/cart"), only its (nonexistent) subpaths.
        "/admin",
        "/account",
        "/checkout",
        "/cart",
        "/wishlist",
        "/api/",
        // Avoid indexing duplicate filter/sort variations of listing pages,
        // per Google's ecommerce pagination guidance.
        "/*?*sort=",
        "/*?*minPrice=",
        "/*?*maxPrice=",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
