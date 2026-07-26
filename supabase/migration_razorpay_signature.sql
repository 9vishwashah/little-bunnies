-- =============================================
-- LITTLE BUNNIES — Razorpay integration migration
-- =============================================
-- Adds the one column the Razorpay checkout flow needs that wasn't already
-- on the `orders` table, plus a lookup index. Safe to run multiple times —
-- every statement is idempotent (IF NOT EXISTS), so re-running this file
-- if you're unsure whether it already applied will not error or duplicate
-- anything. This is the same change already folded into supabase/schema.sql;
-- this file exists purely so you can run just the delta on an existing
-- database without re-running the whole schema.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
