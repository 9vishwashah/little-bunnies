// =============================================
// LITTLE BUNNIES — Shared TypeScript Types
// =============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier: number;
  sku_suffix?: string;
  image_url?: string;
}

export type ProductVideoType = "assembly" | "features";

export interface ProductVideo {
  id: string;
  product_id: string;
  type: ProductVideoType;
  url: string;
  thumbnail_url?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  category_id?: string;
  brand?: string;
  sku?: string;
  tags?: string[];
  age_group?: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  in_stock: boolean;
  weight?: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  // Relations
  categories?: Category;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  product_videos?: ProductVideo[];
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
  rating: number;
  title?: string;
  body: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  users?: { full_name: string; avatar_url?: string };
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

export interface CartItem {
  id: string; // product_id
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    value: string;
    price_modifier: number;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  payment_proof_url?: string;
  payment_proof_declared?: boolean;
  subtotal: number;
  discount_amount: number;
  custom_name_charge?: number;
  shipping_amount: number;
  total: number;
  coupon_id?: string;
  shipping_address: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "razorpay" | "upi" | "bank_transfer";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
  expires_at?: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  cta_text?: string;
  cta_link?: string;
  badge_text?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  ageGroup?: string;
  brand?: string;
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest" | "top_rated";
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
