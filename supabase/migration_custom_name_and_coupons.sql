-- =============================================
-- LITTLE BUNNIES — Custom-name breakdown + coupon redemption
-- =============================================
-- Safe to run multiple times — every statement is idempotent.

-- 1. Explicit column for the ₹299 custom-name personalization charge, so it
--    shows as its own line in invoices/emails instead of being folded
--    invisibly into `total`.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS custom_name_charge DECIMAL(10, 2) DEFAULT 0;

-- 2. RPC used to bump a coupon's usage count after a coupon-discounted
--    order is paid (the app code already called this function name, but it
--    was never created in the database).
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons SET uses_count = uses_count + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Seed the site-wide promotional coupon shown on product pages
--    (10% off, no minimum order, no expiry, no usage cap).
INSERT INTO public.coupons (code, type, value, min_order_amount, is_active)
VALUES ('FAMILY10', 'percentage', 10, 0, TRUE)
ON CONFLICT (code) DO NOTHING;
