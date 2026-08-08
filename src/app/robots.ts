import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://littlebunnies.co.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/prams-strollers",
          "/prams",
          "/baby-prams-strollers",
          "/products",
          "/products/",
          "/product/",
          "/about",
          "/contact",
          "/faq",
          "/wholesale",
          "/work-for-us",
          "/shipping-policy",
          "/returns",
          "/exchange-policy",
          "/privacy-policy",
          "/terms",
        ],
        disallow: [
          // Private user routes
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/checkout",
          "/checkout/",
          "/cart",
          "/wishlist",
          "/api/",
          "/sign-in",
          "/sign-up",
          // Noise: filter/sort/pagination variations that create duplicate content.
          // Google's ecommerce guidance says to consolidate these to the canonical
          // listing page via the canonical tag, and disallow them in robots.txt.
          "/*?*sort=",
          "/*?*minPrice=",
          "/*?*maxPrice=",
          "/*?*inStock=",
          "/*?*brand=",
          "/*?*page=",
          // Noise: /product/color and similar invalid slug pages seen in GSC
          "/product/color",
        ],
      },
      // Disallow crawling of Next.js internal chunks, but explicitly allow next/image for Google Lens & image SEO
      {
        userAgent: "*",
        allow: ["/_next/image*", "/images/"],
        disallow: ["/_next/static/", "/_next/data/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/_next/image*", "/images/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
