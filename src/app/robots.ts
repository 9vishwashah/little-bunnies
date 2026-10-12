import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private / transactional routes — no search value
          "/admin",
          "/account",
          "/checkout",
          "/cart",
          "/wishlist",
          "/api/",
          "/sign-in",
          "/sign-up",
          // Filter/sort/pagination variations create duplicate content; Google's
          // ecommerce guidance is to consolidate to the canonical listing page.
          "/*?*sort=",
          "/*?*minPrice=",
          "/*?*maxPrice=",
          "/*?*inStock=",
          "/*?*brand=",
          "/*?*page=",
          "/*?*search=",
        ],
      },
      // NOTE: /_next/static/ (CSS + JS) and /_next/image are deliberately NOT
      // blocked. An earlier version disallowed /_next/static/, which stops
      // Googlebot from loading the stylesheets and scripts it needs to render
      // pages — Google's guidelines explicitly say not to block those.
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
