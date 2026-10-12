import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClientV2";
import { Product } from "@/types";
import { SITE_URL, jsonLd, stripHtml, productDisplayName, productKind } from "@/lib/seo";
import { truncate, calculateShipping, categoryHref } from "@/lib/utils";
import { SHOW_AMAZON_LINKS, getAmazonListing } from "@/lib/amazon";
import { canonicalProductSlug, legacySlugFor } from "@/lib/productSlugs";
import ProductSection from "@/components/layout/home/ProductSection";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ video?: string }>;
}

const PRODUCT_SELECT = `*,
        product_images(id, url, alt, is_primary, sort_order),
        product_variants(id, name, value, price_modifier, image_url),
        product_videos(id, type, url, thumbnail_url),
        categories(id, name, slug),
        reviews(id, rating, title, body, guest_name, created_at, is_approved, is_verified_purchase)`;

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * One lookup. `legacy` matches a pre-rename slug case-insensitively (slugs are
 * hyphen-only, so ilike behaves as an exact, case-insensitive match).
 */
async function fetchProductRow(supabase: SupabaseServer, slug: string, legacy: boolean) {
  const query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);
  return legacy ? query.ilike("slug", slug).maybeSingle() : query.eq("slug", slug).maybeSingle();
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();

    let { data, error } = await fetchProductRow(supabase, slug, false);

    // A genuine database hiccup must not turn a real product into a
    // "Product Not Found" (noindex) page while Googlebot is looking — retry once.
    if (error) {
      await new Promise((r) => setTimeout(r, 250));
      ({ data, error } = await fetchProductRow(supabase, slug, false));
    }

    // Renamed slug whose database row hasn't been updated yet (see productSlugs.ts).
    if (!data && !error) {
      const legacy = legacySlugFor(slug);
      if (legacy) ({ data } = await fetchProductRow(supabase, legacy, true));
    }

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

function productCanonical(product: Product): string {
  return `${SITE_URL}/product/${canonicalProductSlug(product.slug)}`;
}

function productName(product: Product): string {
  return productDisplayName({
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    categorySlug: product.categories?.slug,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found", robots: { index: false, follow: true } };

  const image = product.product_images?.find((img) => img.is_primary)?.url;
  const fallbackImage = `${SITE_URL}/images/banner2.png`;
  const ogImage = image || fallbackImage;
  const canonical = productCanonical(product);
  const displayName = productName(product);

  const description = truncate(
    product.meta_description ||
      product.short_description ||
      `Buy ${displayName} online in India from Little Bunnies. Free shipping above ₹5,999.`,
    160
  );

  // meta_title (editable in the admin) wins; otherwise a clean model-based
  // title rather than the raw pipe-separated feature list stored in `name`.
  const titleString =
    product.meta_title || `${displayName} | Buy Online India | Little Bunnies`;

  const allImages = product.product_images?.length
    ? product.product_images.slice(0, 4).map((img) => ({
        url: img.url,
        width: 800,
        height: 800,
        alt: img.alt || displayName,
      }))
    : [{ url: fallbackImage, width: 1200, height: 630, alt: displayName }];

  return {
    title: { absolute: titleString },
    description,
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
          alt: displayName,
        },
      ],
    },
  };
}

function buildProductJsonLd(product: Product) {
  const canonical = productCanonical(product);
  const images = product.product_images?.length
    ? product.product_images.map((img) => img.url)
    : [`${SITE_URL}/images/banner2.png`];

  const description = stripHtml(
    product.description || product.short_description || product.name
  );

  const variantColors = product.product_variants
    ?.map((v) => v.value)
    ?.filter(Boolean);

  const amazon = getAmazonListing(product.slug);

  // Everything below must be true of THIS product/page — Google's structured
  // data guidelines require markup to match what's actually offered. (An
  // earlier version hardcoded materials like "Aerospace-grade Aluminium" on
  // every product, a free-return policy this store doesn't have, and free
  // shipping at every price.)
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName(product),
    url: canonical,
    image: images,
    description,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: { "@type": "Brand", name: "Little Bunnies" },
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
          value: String(calculateShipping(product.price)),
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
            minValue: 2,
            maxValue: 4,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 7,
            maxValue: 10,
            unitCode: "DAY",
          },
        },
      },
      // Matches /exchange-policy: exchange (or store credit) within 15 days,
      // customer-paid ₹200 reverse pickup — not a free-return policy.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 15,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
        returnShippingFeesAmount: {
          "@type": "MonetaryAmount",
          value: "200",
          currency: "INR",
        },
        refundType: "https://schema.org/ExchangeRefund",
        merchantReturnLink: `${SITE_URL}/exchange-policy`,
      },
    },
  };

  if (variantColors?.length) schema.color = variantColors.join(", ");
  if (product.categories?.name) schema.category = product.categories.name;
  // The same item, listed on Amazon.in — an entity-corroboration signal.
  if (amazon) schema.sameAs = [amazon.url];

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
  const kind = productKind({
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    categorySlug: product.categories?.slug,
  });
  // Home → the landing page this product belongs under → the product.
  const section =
    kind === "stroller"
      ? { name: "Prams & Strollers", item: `${SITE_URL}/prams-strollers` }
      : kind === "bag"
      ? { name: "Diaper Bags", item: `${SITE_URL}/diaper-bags` }
      : { name: "Products", item: `${SITE_URL}/products` };

  const items = [
    { name: "Home", item: SITE_URL },
    section,
    { name: productName(product), item: productCanonical(product) },
  ];

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

  const amazon = SHOW_AMAZON_LINKS ? getAmazonListing(product.slug) : null;

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
      <ProductDetailClient
        product={product}
        relatedProducts={[]}
        initialVideo={video}
        amazonUrl={amazon?.url}
      />
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
        viewAllHref={categorySlug ? categoryHref(categorySlug) : "/products"}
        badge="Related"
        scrollable
      />
    </div>
  );
}
