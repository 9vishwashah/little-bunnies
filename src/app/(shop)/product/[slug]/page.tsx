import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClientV2";
import { Product } from "@/types";
import { SITE_URL, jsonLd, stripHtml } from "@/lib/seo";
import { truncate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
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
  const fallbackImage = "/images/LittleBunnies-Banner.png";
  const ogImage = image || fallbackImage;
  const canonical = `${SITE_URL}/product/${product.slug}`;

  const description = truncate(
    product.meta_description ||
      product.short_description ||
      `Buy ${product.name} from Little Bunnies. Premium baby product, safe for newborns aged 0-6 months.`,
    160
  );

  return {
    // Bypasses the root layout's "%s | Little Bunnies" title template so we
    // control the exact string shown in search results / share previews.
    title: { absolute: `${product.name} | Little Bunnies - Premium Baby Products` },
    description,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description,
      url: canonical,
      siteName: "Little Bunnies",
      images: [
        {
          url: ogImage,
          width: image ? 800 : 1200,
          height: image ? 800 : 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
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
    : [`${SITE_URL}/images/LittleBunnies-Banner.png`];

  const description = stripHtml(
    product.description || product.short_description || product.name
  );

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description,
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: product.brand || "Little Bunnies" },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: String(product.price),
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (product.categories?.name) {
    schema.category = product.categories.name;
  }

  if (product.review_count && product.review_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (product.avg_rating || 0).toFixed(1),
      reviewCount: product.review_count,
    };
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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
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
      <ProductDetailClient product={product} relatedProducts={[]} />
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
