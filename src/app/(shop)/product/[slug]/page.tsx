import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClientV2";
import { Product } from "@/types";
import { SITE_URL, jsonLd, stripHtml } from "@/lib/seo";
import { truncate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ video?: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(
        `*,
        product_images(id, url, alt, is_primary, sort_order),
        product_variants(id, name, value, price_modifier, image_url),
        product_videos(id, type, url, thumbnail_url),
        categories(id, name, slug),
        reviews(id, rating, title, body, guest_name, created_at, is_approved, is_verified_purchase)`
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!data) return null;

    // Calculate avg rating
    const approvedReviews = (data as unknown as Product).reviews?.filter(
      (r) => r.is_approved
    ) || [];
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
          approvedReviews.length
        : 0;

    return {
      ...(data as unknown as Product),
      avg_rating: avgRating,
      review_count: approvedReviews.length,
    };
  } catch {
    return null;
  }
}

async function getRelatedProducts(categoryId: string, currentId: string): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(`*, product_images(id, url, alt, is_primary, sort_order), product_variants(id, name, value, price_modifier, sku_suffix, image_url)`)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .neq("id", currentId)
      .limit(6);
    return (data as unknown as Product[]) || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const image = product.product_images?.find((img) => img.is_primary)?.url;
  const fallbackImage = `${SITE_URL}/images/banner2.png`;
  const ogImage = image || fallbackImage;
  const canonical = `${SITE_URL}/product/${product.slug}`;

  const description = truncate(
    product.meta_description ||
      product.short_description ||
      `Buy ${product.name} from Little Bunnies. Premium baby product, safe for newborns aged 0-6 months.`,
    160
  );

  // Falls back to the short brand/model name when a hand-written meta_title
  // is missing, rather than the raw feature-list `name` — a title tag made
  // of pipe-separated features doesn't read as a real product name in
  // search results.
  const titleString =
    product.meta_title ||
    (product.brand
      ? `Little Bunnies ${product.brand} | Premium Baby Products`
      : `${product.name} | Little Bunnies - Premium Baby Products`);

  const keywords = [
    product.name,
    "Little Bunnies " + product.name,
    product.brand || "Little Bunnies",
    product.categories?.name || "Baby Products",
    "baby stroller",
    "pram",
    "newborn stroller india",
    "buy " + product.name + " online",
    "little bunnies pram",
    "comfy rider pro",
    "comfy rider pro stroller",
    "comfy rider pro pram",
    "360 degree stroller",
    "lightweight baby stroller",
    ...(product.tags ? product.tags : []),
  ];

  const allImages = product.product_images?.length
    ? product.product_images.slice(0, 4).map((img) => ({
        url: img.url,
        width: 800,
        height: 800,
        alt: img.alt || product.name,
      }))
    : [{ url: fallbackImage, width: 1200, height: 630, alt: product.name }];

  return {
    title: { absolute: titleString },
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: titleString,
      description,
      url: canonical,
      siteName: "Little Bunnies",
      images: allImages,
    },
    twitter: {
      card: "summary_large_image",
      title: titleString,
      description,
      images: [
        {
          url: ogImage,
          alt: product.name,
        },
      ],
    },
  };
}

import { Suspense } from "react";
import ProductSection from "@/components/layout/home/ProductSection";

function buildProductJsonLd(product: Product) {
  const canonical = `${SITE_URL}/product/${product.slug}`;
  const images = product.product_images?.length
    ? product.product_images.map((img) => img.url)
    : [`${SITE_URL}/images/banner2.png`];

  const description = stripHtml(
    product.description || product.short_description || product.name
  );

  const isPramOrStroller =
    product.categories?.slug === "prams" ||
    product.categories?.slug === "strollers" ||
    product.name.toLowerCase().includes("pram") ||
    product.name.toLowerCase().includes("stroller") ||
    product.name.toLowerCase().includes("comfy rider");

  const variantColors = product.product_variants
    ?.map((v) => v.value)
    ?.filter(Boolean);

  // `product.brand` in this catalog actually stores a short model name
  // (e.g. "Multipurpose Quilted Diaper Bag"), not a manufacturer — `name`
  // is a pipe-separated feature list, not a real product name. Neither is
  // fit to use as-is for structured data: schema.org's Product `name`
  // should be a clean, searchable title, and `brand` should be the actual
  // brand consistently across every product.
  const schemaName = product.brand ? `Little Bunnies ${product.brand}` : product.name;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: schemaName,
    image: images,
    description,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: { "@type": "Brand", name: "Little Bunnies" },
    color: variantColors?.length ? variantColors.join(", ") : "Standard / Premium Multicolor",
    material: isPramOrStroller
      ? "Aerospace-grade Aluminium Frame, UPF 50++ Linen Weather Canopy, High-density EVA Wheels"
      : "Baby-Safe Certified Premium Material",
    pattern: "Solid",
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: 0,
      suggestedMaxAge: 4,
      suggestedAgeUnit: "Years",
    },
    category: isPramOrStroller
      ? "Baby & Toddler > Baby Transport > Baby Strollers"
      : product.categories?.name || "Baby & Toddler > Baby Essentials",
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: String(product.price),
      priceValidUntil: "2027-12-31",
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Little Bunnies",
        url: SITE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 5,
            maxValue: 10,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 15,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  if (product.categories?.name) {
    schema.category = product.categories.name;
  }

  const approvedReviews = product.reviews?.filter((r) => r.is_approved) || [];
  if (approvedReviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (product.avg_rating || 0).toFixed(1),
      reviewCount: approvedReviews.length,
    };
    schema.review = approvedReviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: r.guest_name || "Verified Customer",
      },
      datePublished: r.created_at ? r.created_at.split("T")[0] : undefined,
      reviewBody: r.body || r.title || "Great product!",
    }));
  }

  return schema;
}

function buildBreadcrumbJsonLd(product: Product) {
  const items = [
    { name: "Home", item: SITE_URL },
    { name: "Products", item: `${SITE_URL}/products` },
  ];

  if (product.categories) {
    items.push({
      name: product.categories.name,
      item: `${SITE_URL}/products?category=${product.categories.slug}`,
    });
  }

  items.push({ name: product.name, item: `${SITE_URL}/product/${product.slug}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { video } = await searchParams;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
      {/* Facebook/WhatsApp product-preview hints — Next's typed metadata API
          has no "product" og:type and its `other` field only emits `name=`
          attributes, but the Open Graph product extension requires
          `property=`, so these are rendered directly instead. */}
      <meta property="product:price:amount" content={String(product.price)} />
      <meta property="product:price:currency" content="INR" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildProductJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildBreadcrumbJsonLd(product)) }}
      />
      <ProductDetailClient product={product} relatedProducts={[]} initialVideo={video} />
      {product.category_id && (
        <Suspense fallback={null}>
          <RelatedProducts categoryId={product.category_id} currentId={product.id} categorySlug={product.categories?.slug} />
        </Suspense>
      )}
    </>
  );
}

async function RelatedProducts({ categoryId, currentId, categorySlug }: { categoryId: string, currentId: string, categorySlug?: string }) {
  const related = await getRelatedProducts(categoryId, currentId);
  if (!related || related.length === 0) return null;
  
  return (
    <div className="section-container pb-6 md:pb-10">
      <ProductSection
        title="You May Also Like"
        products={related}
        viewAllHref={`/products?category=${categorySlug}`}
        badge="Related"
        scrollable
      />
    </div>
  );
}
