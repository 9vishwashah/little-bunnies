-- =============================================
-- LITTLE BUNNIES — Full Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Clerk user_id
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT,
  sku TEXT UNIQUE,
  tags TEXT[],
  age_group TEXT DEFAULT '0-6 months',
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  in_stock BOOLEAN DEFAULT TRUE,
  weight DECIMAL(8, 2),
  dimensions JSONB, -- { length, width, height }
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCT IMAGES
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCT VARIANTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Color", "Size"
  value TEXT NOT NULL, -- e.g. "Blue", "Medium"
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  sku_suffix TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVENTORY
-- =============================================
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADDRESSES
-- =============================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'razorpay', 'upi')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  custom_name_charge DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  coupon_id UUID,
  shipping_address JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_name TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WISHLISTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- COUPONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  max_uses INT,
  uses_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BANNERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  badge_text TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('store_name', '"Little Bunnies"'),
  ('whatsapp_number', '"919594503214"'),
  ('free_shipping_threshold', '999'),
  ('currency', '"INR"'),
  ('currency_symbol', '"₹"'),
  ('gst_included', 'true'),
  ('cod_available', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);

-- Idempotent migrations for existing databases created before later features
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS custom_name_charge DECIMAL(10, 2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can view inventory" ON public.inventory FOR SELECT USING (TRUE);

-- Guest review insert
CREATE POLICY "Anyone can submit reviews" ON public.reviews FOR INSERT WITH CHECK (TRUE);

-- User-specific policies (via service role for simplicity, or use Clerk JWT)
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (TRUE);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (TRUE);

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view order items" ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can manage wishlists" ON public.wishlists FOR ALL USING (TRUE);

CREATE POLICY "Public can validate coupons" ON public.coupons FOR SELECT USING (is_active = TRUE);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generator function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'LB' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT COUNT(*) > 0 INTO exists FROM public.orders WHERE order_number = new_number;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Coupon usage counter — called after a coupon-discounted order is paid
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons SET uses_count = uses_count + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Seed the site-wide promotional coupon shown on product pages
INSERT INTO public.coupons (code, type, value, min_order_amount, is_active)
VALUES ('FREEDOM20', 'percentage', 20, 0, TRUE)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- CONTACT MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (since it's a public contact form)
CREATE POLICY "Allow public inserts" ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Only allow authenticated admins to read the messages
CREATE POLICY "Allow authenticated reads" ON public.contact_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');
