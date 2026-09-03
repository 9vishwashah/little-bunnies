-- =============================================
-- LITTLE BUNNIES — AblePay Payment Gateway
-- Replaces the (never-launched) Razorpay integration with AblePay's
-- hosted/redirect payment gateway. Run this once in the Supabase SQL editor.
-- =============================================

-- =============================================
-- ORDERS: add AblePay transaction reference column
-- =============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ablepay_transaction_id TEXT;

-- Widen the payment_method CHECK constraint to allow 'ablepay'. Also folds in
-- 'cash' (used by the admin walk-in order form) which the base schema never
-- had in its constraint. 'razorpay' is left in place for forward-compatibility
-- even though no live order has ever used it (that integration was never
-- wired into the checkout UI).
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
  CHECK (payment_method IN ('cod', 'cash', 'razorpay', 'upi', 'bank_transfer', 'ablepay'));
