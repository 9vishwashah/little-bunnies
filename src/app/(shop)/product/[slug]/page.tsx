import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClient";
import { Product } from "@/types";

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
      .select(`*, product_images(id, url, alt, is_primary, sort_order)`)
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

  const title = product.meta_title || product.name;
  const description =
    product.meta_description ||
    product.short_description ||
    `Buy ${product.name} from Little Bunnies. Premium baby product, safe for newborns aged 0-6 months.`;

  const price = product.compare_price || product.price;

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
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
