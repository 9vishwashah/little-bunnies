-- =============================================
-- LITTLE BUNNIES — Bank QR Transfer Payment
-- Replaces the Razorpay checkout step with a bank QR code + customer-
-- uploaded transaction screenshot, verified manually by the admin.
-- Run this once in the Supabase SQL editor.
-- =============================================

-- =============================================
-- ORDERS: widen payment_method, add proof-of-payment columns
-- =============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_declared BOOLEAN DEFAULT FALSE;

-- Drop whatever the existing payment_method CHECK constraint is named
-- (Postgres auto-names it, so this looks it up rather than assuming) and
-- recreate it with 'bank_transfer' added.
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
  CHECK (payment_method IN ('cod', 'razorpay', 'upi', 'bank_transfer'));

-- =============================================
-- SETTINGS: universal bank QR code image shown at checkout
-- =============================================
INSERT INTO public.settings (key, value) VALUES ('bank_qr_code_url', 'null')
ON CONFLICT (key) DO NOTHING;
