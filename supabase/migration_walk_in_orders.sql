-- =============================================
-- LITTLE BUNNIES — Walk-in / In-person Orders
-- Lets the store owner place an order on behalf of a customer visiting
-- in person, from a private admin-only page. Adds a 'cash' payment method
-- and an is_walk_in flag so these orders are distinguishable from normal
-- online orders in reporting/listings. Delivery is always free on these
-- orders (enforced in application code, not here).
-- Run this once in the Supabase SQL editor.
-- =============================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT FALSE;

-- Drop whatever the existing payment_method CHECK constraint is named
-- (Postgres auto-names it, so this looks it up rather than assuming) and
-- recreate it with 'cash' added.
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%payment_method%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'razorpay', 'upi', 'bank_transfer', 'cash'));
